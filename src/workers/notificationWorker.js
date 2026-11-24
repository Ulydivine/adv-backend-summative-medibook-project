const redisClient = require('../config/redis');
const logAuditEvent = require('../utils/auditLogger');

const startNotificationWorker = async () => {
    await redisClient.connect();

    console.log('Notification worker is running...');

    while (true) {
        try {
            const job = await redisClient.brPop('notification:jobs', 0);

            const notification = JSON.parse(job.element);

            const message = `Your appointment with doctor ${notification.doctor_id} is confirmed for ${notification.appointment_datetime}.`;

            // Record the SMS confirmation
            await logAuditEvent({
                action: 'appointment_notification',
                type: 'SMS',
                appointment_id: notification.appointment_id,
                patient_id: notification.patient_id,
                message
            });

            // Record the email confirmation
            await logAuditEvent({
                action: 'appointment_notification',
                type: 'Email',
                appointment_id: notification.appointment_id,
                patient_id: notification.patient_id,
                message
            });

            console.log(
                `Notifications recorded for appointment ${notification.appointment_id}`
            );
        } catch (error) {
            console.error('Notification worker error:', error.message);
        }
    }
};

startNotificationWorker();