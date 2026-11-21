
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

module.exports = {
    getAllDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor
};
