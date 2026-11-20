
USE medibook;

-- Sample patients
INSERT INTO patients (patient_id, name, email, phone) VALUES
(1, 'Aline Uwimana', 'aline@example.rw', '+250788123456'),
(2, 'Eric Niyonzima', 'eric@example.rw', '+250788234567'),
(3, 'Diane Mukamana', 'diane@example.rw', '+250788345678');

-- Sample doctors
INSERT INTO doctors (doctor_id, name, specialty, consultation_fee, room) VALUES
(1, 'Dr. Jean Claude', 'Dermatology', 150.00, 'R-12'),
(2, 'Dr. Grace Ingabire', 'Paediatrics', 100.00, 'R-03'),
(3, 'Dr. Patrick Habimana', 'Cardiology', 200.00, 'R-08');

-- Sample appointments
-- Dr. Jean Claude has 11 appointments on one day.
INSERT INTO appointments
(patient_id, doctor_id, appointment_datetime, amount_paid)
VALUES
(1, 1, '2027-01-12 09:00:00', 150.00),
(2, 1, '2027-01-12 09:30:00', 150.00),
(3, 1, '2027-01-12 10:00:00', 150.00),
(1, 1, '2027-01-12 10:30:00', 150.00),
(2, 1, '2027-01-12 11:00:00', 150.00),
(3, 1, '2027-01-12 11:30:00', 150.00),
(1, 1, '2027-01-12 12:00:00', 150.00),
(2, 1, '2027-01-12 12:30:00', 150.00),
(3, 1, '2027-01-12 13:00:00', 150.00),
(1, 1, '2027-01-12 13:30:00', 150.00),
(2, 1, '2027-01-12 14:00:00', 150.00),

-- Dr. Grace has 2 appointments.
(1, 2, '2027-01-13 09:00:00', 100.00),
(3, 2, '2027-01-13 09:30:00', 100.00);
