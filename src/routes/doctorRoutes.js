

const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctorController');

// Doctor report routes
router.get('/reports/summary', doctorController.getDoctorsReport);
router.get('/reports/busy-days', doctorController.getBusyDaysReport);

// Doctor statistics
router.get('/:id/stats', doctorController.getDoctorStats);

// Basic doctor routes
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.post('/', doctorController.createDoctor);
router.put('/:id', doctorController.updateDoctor);
router.delete('/:id', doctorController.deleteDoctor);

module.exports = router;
