
const pool = require('../config/database');

// Get all appointments
const getAllAppointments = async () => {
    const [rows] = await pool.execute(
        `SELECT 
            appointments.*,
            patients.name AS patient_name,
            doctors.name AS doctor_name
        FROM appointments
        JOIN patients ON appointments.patient_id = patients.patient_id
        JOIN doctors ON appointments.doctor_id = doctors.doctor_id
        ORDER BY appointment_datetime`
    );

    return rows;
};

// Get one appointment by ID
const getAppointmentById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM appointments WHERE appointment_id = ?',
        [id]
    );

    return rows[0];
};

// Create an appointment
const createAppointment = async (appointment) => {
    const [result] = await pool.execute(
        `INSERT INTO appointments
        (patient_id, doctor_id, appointment_datetime, amount_paid)
        VALUES (?, ?, ?, ?)`,
        [
            appointment.patient_id,
            appointment.doctor_id,
            appointment.appointment_datetime,
            appointment.amount_paid
        ]
    );

    return result.insertId;
};

module.exports = {
    getAllAppointments,
    getAppointmentById,
    createAppointment
};
