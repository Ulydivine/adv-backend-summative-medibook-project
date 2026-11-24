
const redisClient = require('../config/redis');

// Create a separate waitlist for each doctor and appointment time
const getWaitlistKey = (doctorId, appointmentDateTime) => {
    const appointmentDate = appointmentDateTime.split(' ')[0];

    return `waitlist:doctor:${doctorId}:date:${appointmentDate}`;
};

// Add a patient to the end of the waitlist
const addToWaitlist = async (doctorId, appointmentDateTime, patient) => {
    const waitlistKey = getWaitlistKey(doctorId, appointmentDateTime);

    const patientData = JSON.stringify({
    patient_id: patient.patient_id,
    doctor_id: doctorId,
    appointment_datetime: appointmentDateTime,
    amount_paid: patient.amount_paid,
    waitlist_reason: patient.waitlist_reason
});

    await redisClient.rPush(waitlistKey, patientData);

    return {
        message: 'Patient added to the waitlist'
    };
};

// Get the number of patients waiting for a slot
const getWaitlistCount = async (doctorId, appointmentDateTime) => {
    const waitlistKey = getWaitlistKey(doctorId, appointmentDateTime);

    return await redisClient.lLen(waitlistKey);
};


// Remove and return the first patient in the waitlist
const getNextPatient = async (doctorId, appointmentDateTime) => {
    const waitlistKey = getWaitlistKey(doctorId, appointmentDateTime);

    const patientData = await redisClient.lPop(waitlistKey);

    return patientData ? JSON.parse(patientData) : null;
};

// Put a patient back at the front of the waitlist
const restorePatient = async (doctorId, appointmentDateTime, patient) => {
    const waitlistKey = getWaitlistKey(doctorId, appointmentDateTime);

    await redisClient.lPush(waitlistKey, JSON.stringify(patient));
};

module.exports = {
    addToWaitlist,
    getWaitlistCount,
    getWaitlistKey,
    getNextPatient,
    restorePatient
};