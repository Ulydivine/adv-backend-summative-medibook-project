
const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');

// Appointment routes
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;
