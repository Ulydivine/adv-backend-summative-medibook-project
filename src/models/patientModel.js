
const pool = require('../config/database');

// Get all patients
const getAllPatients = async () => {
    const [rows] = await pool.execute(
        'SELECT * FROM patients'
    );

    return rows;
};

// Get one patient by ID
const getPatientById = async (id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM patients WHERE patient_id = ?',
        [id]
    );

    return rows[0];
};

// Create a patient
const createPatient = async (patient) => {
    const [result] = await pool.execute(
        'INSERT INTO patients (name, email, phone) VALUES (?, ?, ?)',
        [patient.name, patient.email, patient.phone]
    );

    return result.insertId;
};

// Update a patient
const updatePatient = async (id, patient) => {
    const [result] = await pool.execute(
        'UPDATE patients SET name = ?, email = ?, phone = ? WHERE patient_id = ?',
        [patient.name, patient.email, patient.phone, id]
    );

    return result.affectedRows;
};

// Delete a patient
const deletePatient = async (id) => {
    const [result] = await pool.execute(
        'DELETE FROM patients WHERE patient_id = ?',
        [id]
    );

    return result.affectedRows;
};

module.exports = {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
};
