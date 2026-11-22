
const appointmentModel = require('../models/appointmentModel');

// Get all appointments
const getAllAppointments = async (req, res, next) => {
    try {
        const appointments = await appointmentModel.getAllAppointments();

        res.status(200).json(appointments);
    } catch (error) {
        next(error);
    }
};

// Get one appointment
const getAppointmentById = async (req, res, next) => {
    try {
        const appointment = await appointmentModel.getAppointmentById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        res.status(200).json(appointment);
    } catch (error) {
        next(error);
    }
};

// Create an appointment
const createAppointment = async (req, res, next) => {
    try {
        const {
            patient_id,
            doctor_id,
            appointment_datetime
        } = req.body;

        if (!patient_id || !doctor_id || !appointment_datetime) {
            return res.status(400).json({
                message: 'Patient ID, doctor ID and appointment date and time are required'
            });
        }

        // Check that the appointment date and time are valid
        const appointmentDate = new Date(appointment_datetime);

        if (Number.isNaN(appointmentDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid appointment date and time'
            });
        }

        if (appointmentDate <= new Date()) {
            return res.status(422).json({
                message: 'Appointment must be in the future'
            });
        }

        const time = appointment_datetime.split(' ')[1];

        if (!time) {
            return res.status(400).json({
                message: 'Use YYYY-MM-DD HH:MM:SS for appointment date and time'
            });
        }

        const [hours, minutes, seconds] = time.split(':').map(Number);

        if (
            hours < 9 ||
            hours >= 17 ||
            ![0, 30].includes(minutes) ||
            seconds !== 0
        ) {
            return res.status(422).json({
                message: 'Appointments must be between 09:00 and 17:00 on 30-minute slots'
            });
        }

        // Get the doctor's consultation fee
        const doctor = await require('../models/doctorModel').getDoctorById(doctor_id);

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        // Create the appointment
        const appointmentId = await appointmentModel.createAppointment({
            patient_id,
            doctor_id,
            appointment_datetime,
            amount_paid: doctor.consultation_fee
        });

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment_id: appointmentId
        });
    } catch (error) {
        next(error);
    }
};


 // Cancel an appointment
const cancelAppointment = async (req, res, next) => {
    try {
        const result = await appointmentModel.cancelAppointment(req.params.id);

        res.status(200).json({
            message: 'Appointment cancelled successfully',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    cancelAppointment
};
