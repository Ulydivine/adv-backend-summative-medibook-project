

const doctorModel = require('../models/doctorModel');

// Get all doctors
const getAllDoctors = async (req, res, next) => {
    try {
        const doctors = await doctorModel.getAllDoctors();
        res.status(200).json(doctors);
    } catch (error) {
        next(error);
    }
};

// Get one doctor
const getDoctorById = async (req, res, next) => {
    try {
        const doctor = await doctorModel.getDoctorById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        res.status(200).json(doctor);
    } catch (error) {
        next(error);
    }
};

// Create a doctor
const createDoctor = async (req, res, next) => {
    try {
        const { name, specialty, consultation_fee, room } = req.body;

        if (!name || !specialty || !consultation_fee || !room) {
            return res.status(400).json({
                message: 'Name, specialty, consultation fee and room are required'
            });
        }

        const doctorId = await doctorModel.createDoctor({
            name,
            specialty,
            consultation_fee,
            room
        });

        res.status(201).json({
            message: 'Doctor created successfully',
            doctor_id: doctorId
        });
    } catch (error) {
        next(error);
    }
};

// Update a doctor
const updateDoctor = async (req, res, next) => {
    try {
        const { name, specialty, consultation_fee, room } = req.body;

        if (!name || !specialty || !consultation_fee || !room) {
            return res.status(400).json({
                message: 'Name, specialty, consultation fee and room are required'
            });
        }

        const result = await doctorModel.updateDoctor(req.params.id, {
            name,
            specialty,
            consultation_fee,
            room
        });

        if (result === 0) {
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            message: 'Doctor updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Delete a doctor
const deleteDoctor = async (req, res, next) => {
    try {
        const result = await doctorModel.deleteDoctor(req.params.id);

        if (result === 0) {
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        res.status(200).json({
            message: 'Doctor deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get statistics for one doctor
const getDoctorStats = async (req, res, next) => {
    try {
        const stats = await doctorModel.getDoctorStats(req.params.id);

        if (!stats) {
            return res.status(404).json({
                message: 'Doctor not found'
            });
        }

        res.status(200).json(stats);
    } catch (error) {
        next(error);
    }
};

// Get report for all doctors
const getDoctorsReport = async (req, res, next) => {
    try {
        const report = await doctorModel.getDoctorsReport();
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

// Get busy days report
const getBusyDaysReport = async (req, res, next) => {
    try {
        const report = await doctorModel.getBusyDaysReport();
        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
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
