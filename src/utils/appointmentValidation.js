const validateAppointmentDateTime = (appointmentDateTime, now = new Date()) => {
    if (!appointmentDateTime || typeof appointmentDateTime !== 'string') {
        return {
            status: 400,
            message: 'Use YYYY-MM-DD HH:MM:SS for appointment date and time'
        };
    }

    const appointmentDate = new Date(appointmentDateTime);

    if (Number.isNaN(appointmentDate.getTime())) {
        return {
            status: 400,
            message: 'Invalid appointment date and time'
        };
    }

    if (appointmentDate <= now) {
        return {
            status: 422,
            message: 'Appointment must be in the future'
        };
    }

    const time = appointmentDateTime.split(' ')[1];

    if (!time) {
        return {
            status: 400,
            message: 'Use YYYY-MM-DD HH:MM:SS for appointment date and time'
        };
    }

    const [hours, minutes, seconds] = time.split(':').map(Number);

    if (
        hours < 9 ||
        hours >= 17 ||
        ![0, 30].includes(minutes) ||
        seconds !== 0
    ) {
        return {
            status: 422,
            message: 'Appointments must be between 09:00 and 17:00 on 30-minute slots'
        };
    }

    return null;
};

module.exports = validateAppointmentDateTime;