

const redisClient = require('../config/redis');
require('dotenv').config();

const notificationRedisClient = redisClient.duplicate();

const waitlistModel = require('../models/waitlistModel');
const appointmentModel = require('../models/appointmentModel');
const logAuditEvent = require('../utils/auditLogger');

// Find the first patient who can use the cancelled appointment slot
const findEligiblePatient = async (doctorId, appointmentDateTime) => {
    const waitlistKey = waitlistModel.getWaitlistKey(
        doctorId,
        appointmentDateTime
    );

    const queueLength = await redisClient.lLen(waitlistKey);

    for (let i = 0; i < queueLength; i++) {
        const patientData = await redisClient.lPop(waitlistKey);

        if (!patientData) {
            break;
        }

        const patient = JSON.parse(patientData);

        const sameTime =
            patient.appointment_datetime === appointmentDateTime;

        const canUseSlot =
            patient.waitlist_reason === 'daily_limit' || sameTime;

        if (canUseSlot) {
            return patient;
        }

        // Keep patients who cannot use this slot in the queue
        await redisClient.rPush(waitlistKey, patientData);
    }

    return null;
};

// Listen for appointment cancellation jobs
const startWaitlistWorker = async () => {
    await redisClient.connect();
    await notificationRedisClient.connect();

    console.log('Waitlist worker is running...');

    while (true) {
        try {
            const job = await redisClient.brPop(
                'waitlist:promotion:jobs',
                0
            );

            const { doctor_id, appointment_datetime } =
                JSON.parse(job.element);

            const patient = await findEligiblePatient(
                doctor_id,
                appointment_datetime
            );

            if (!patient) {
                console.log('No eligible patient found for this slot.');
                continue;
            }

            let appointmentId;

            // Create an appointment for the next eligible patient
            try {
                appointmentId = await appointmentModel.createAppointment({
                    patient_id: patient.patient_id,
                    doctor_id: patient.doctor_id,
                    appointment_datetime: appointment_datetime,
                    amount_paid: patient.amount_paid
                });
            } catch (error) {
                await waitlistModel.restorePatient(
                    doctor_id,
                    patient.appointment_datetime,
                    patient
                );

                console.log('Waitlist promotion failed:', error.message);
                continue;
            }

            console.log(
                `Patient ${patient.patient_id} was promoted from the waitlist.`
            );

            // Record the successful booking
            logAuditEvent({
                action: 'appointment_booked',
                appointment_id: appointmentId,
                patient_id: patient.patient_id,
                doctor_id: patient.doctor_id,
                appointment_datetime: appointment_datetime
            });

            // Add a notification job for the confirmed appointment
            try {
                await notificationRedisClient.lPush(
                    'notification:jobs',
                    JSON.stringify({
                        appointment_id: appointmentId,
                        patient_id: patient.patient_id,
                        doctor_id: patient.doctor_id,
                        appointment_datetime: appointment_datetime
                    })
                );
            } catch (error) {
                console.error(
                    'Notification job could not be queued:',
                    error.message
                );
            }

        } catch (error) {
            console.error('Waitlist worker error:', error.message);
        }
    }
};

startWaitlistWorker();
