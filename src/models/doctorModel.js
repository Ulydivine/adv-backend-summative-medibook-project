
const pool = require('../config/database');

// Get all doctors
const getAllDoctors = async () => {
    const [rows] = await pool.execute(
        'SELECT * FROM doctors'
    );

    return rows;
};

// Get one doctor by ID
const getDoctorById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM doctors WHERE doctor_id = ?',
        [id]
    );

    return rows[0];
};

// Create a doctor
const createDoctor = async (doctor) => {
    const [result] = await pool.execute(
        'INSERT INTO doctors (name, specialty, consultation_fee, room) VALUES (?, ?, ?, ?)',
        [doctor.name, doctor.specialty, doctor.consultation_fee, doctor.room]
    );

    return result.insertId;
};

// Update a doctor
const updateDoctor = async (id, doctor) => {
    const [result] = await pool.execute(
        'UPDATE doctors SET name = ?, specialty = ?, consultation_fee = ?, room = ? WHERE doctor_id = ?',
        [doctor.name, doctor.specialty, doctor.consultation_fee, doctor.room, id]
    );

    return result.affectedRows;
};

// Delete a doctor
const deleteDoctor = async (id) => {
    const [result] = await pool.execute(
        'DELETE FROM doctors WHERE doctor_id = ?',
        [id]
    );

    return result.affectedRows;
};

// Get statistics for one doctor
const getDoctorStats = async (id) => {
    const [doctors] = await pool.execute(
        'SELECT doctor_id, name FROM doctors WHERE doctor_id = ?',
        [id]
    );

    if (doctors.length === 0) {
        return null;
    }

    const [summary] = await pool.execute(
        `SELECT
            COALESCE(SUM(amount_paid - refund_amount), 0) AS revenue_collected,
            COUNT(
                CASE
                    WHEN appointment_datetime >= NOW()
                    AND status = 'booked'
                    THEN 1
                END
            ) AS upcoming_appointments
         FROM appointments
         WHERE doctor_id = ?`,
        [id]
    );

    const [dailyAppointments] = await pool.execute(
        `SELECT
            DATE(appointment_datetime) AS appointment_date,
            COUNT(*) AS total_appointments,
            ROUND(COUNT(*) / 12 * 100, 2) AS utilization_percentage
         FROM appointments
         WHERE doctor_id = ?
         AND status = 'booked'
         AND appointment_datetime >= CURDATE()
         AND appointment_datetime < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
         GROUP BY DATE(appointment_datetime)
         ORDER BY appointment_date`,
        [id]
    );

    return {
        doctor: doctors[0],
        revenue_collected: summary[0].revenue_collected,
        upcoming_appointments: summary[0].upcoming_appointments,
        appointments_per_day: dailyAppointments
    };
};

// Get all doctors with their total appointments and revenue
const getDoctorsReport = async () => {
    const [rows] = await pool.execute(
        `SELECT
            doctors.doctor_id,
            doctors.name,
            COUNT(appointments.appointment_id) AS total_appointments,
            COALESCE(
                SUM(appointments.amount_paid - appointments.refund_amount),
                0
            ) AS revenue_collected
         FROM doctors
         LEFT JOIN appointments
            ON doctors.doctor_id = appointments.doctor_id
         GROUP BY doctors.doctor_id, doctors.name
         ORDER BY doctors.doctor_id`
    );

    return rows;
};

// Get days when doctors have more than 80% of their daily capacity booked
const getBusyDaysReport = async () => {
    const [rows] = await pool.execute(
        `SELECT
            doctors.doctor_id,
            doctors.name,
            DATE(appointments.appointment_datetime) AS appointment_date,
            COUNT(*) AS total_appointments,
            ROUND(COUNT(*) / 12 * 100, 2) AS utilization_percentage
         FROM doctors
         JOIN appointments
            ON doctors.doctor_id = appointments.doctor_id
         WHERE appointments.status = 'booked'
         GROUP BY
            doctors.doctor_id,
            doctors.name,
            DATE(appointments.appointment_datetime)
         HAVING COUNT(*) > 12 * 0.8
         ORDER BY appointment_date`
    );

    return rows;
};

module.exports = {
    getAllDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorStats,
    getDoctorsReport,
    getBusyDaysReport
};
