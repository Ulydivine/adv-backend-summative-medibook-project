
const patientModel = require('../models/patientModel');

// Get all patients
const getAllPatients = async (req, res, next) => {
    try {
        const patients = await patientModel.getAllPatients();
        res.status(200).json(patients);
    } catch (error) {
        next(error);
    }
};

// Get one patient
const getPatientById = async (req, res, next) => {
    try {
        const patient = await patientModel.getPatientById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        res.status(200).json(patient);
    } catch (error) {
        next(error);
    }
};

// Create a patient
const createPatient = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                message: 'Name, email and phone are required'
            });
        }

        const patientId = await patientModel.createPatient({
            name,
            email,
            phone
        });

        res.status(201).json({
            message: 'Patient created successfully',
            patient_id: patientId
        });
    } catch (error) {
        next(error);
    }
};

// Update a patient
const updatePatient = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({
                message: 'Name, email and phone are required'
            });
        }

        const result = await patientModel.updatePatient(req.params.id, {
            name,
            email,
            phone
        });

        if (result === 0) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        res.status(200).json({
            message: 'Patient updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Delete a patient
const deletePatient = async (req, res, next) => {
    try {
        const result = await patientModel.deletePatient(req.params.id);

        if (result === 0) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        res.status(200).json({
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
};
