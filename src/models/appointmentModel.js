

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
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Lock the doctor row while checking the daily limit
        await connection.execute(
            'SELECT doctor_id FROM doctors WHERE doctor_id = ? FOR UPDATE',
            [appointment.doctor_id]
        );

       // Check if this exact appointment time is already booked
        const [existingAppointments] = await connection.execute(
            `SELECT appointment_id
             FROM appointments
             WHERE doctor_id = ?
             AND appointment_datetime = ?
             AND status = 'booked'`,
            [
                appointment.doctor_id,
                appointment.appointment_datetime
            ]
        );

        if (existingAppointments.length > 0) {
            const error = new Error('This appointment slot is already booked');
            error.status = 409;
            throw error;
        }
     // Get the number of booked appointments for that day
        const [rows] = await connection.execute(
            `SELECT COUNT(*) AS total
             FROM appointments
             WHERE doctor_id = ?
             AND DATE(appointment_datetime) = DATE(?)
             AND status = 'booked'`,
            [
                appointment.doctor_id,
                appointment.appointment_datetime
            ]
        );

        const totalAppointments = Number(rows[0].total);

        if (totalAppointments >= 12) {
            const error = new Error('Doctor has reached the daily appointment limit');
            error.status = 409;
            throw error;
        }

        // Save the appointment
        const [result] = await connection.execute(
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

        await connection.commit();

        return result.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Cancel an appointment and calculate the refund
const cancelAppointment = async (id) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Find and lock the appointment
        const [rows] = await connection.execute(
            `SELECT *,
                TIMESTAMPDIFF(SECOND, NOW(), appointment_datetime) AS seconds_until
             FROM appointments
             WHERE appointment_id = ?
             FOR UPDATE`,
            [id]
        );

        if (rows.length === 0) {
            const error = new Error('Appointment not found');
            error.status = 404;
            throw error;
        }

        const appointment = rows[0];

        if (appointment.status !== 'booked') {
            const error = new Error('Appointment is already cancelled');
            error.status = 409;
            throw error;
        }

        // Calculate the refund percentage
        const secondsUntil = Number(appointment.seconds_until);
        let refundPercentage = 0;

        if (secondsUntil > 48 * 60 * 60) {
            refundPercentage = 100;
        } else if (secondsUntil >= 24 * 60 * 60) {
            refundPercentage = 50;
        }

        const refundAmount = Number(
            (Number(appointment.amount_paid) * refundPercentage / 100).toFixed(2)
        );

        // Update the appointment
        await connection.execute(
            `UPDATE appointments
             SET status = 'cancelled',
                 cancelled_at = NOW(),
                 refund_percentage = ?,
                 refund_amount = ?
             WHERE appointment_id = ?`,
            [refundPercentage, refundAmount, id]
        );

        await connection.commit();

        return {
            appointment_id: Number(id),
            status: 'cancelled',
            refund_percentage: refundPercentage,
            refund_amount: refundAmount
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllAppointments,
    getAppointmentById,
    createAppointment,
    cancelAppointment
};
