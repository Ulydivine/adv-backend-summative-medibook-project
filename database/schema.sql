
CREATE DATABASE IF NOT EXISTS medibook;

USE medibook;

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL,
    room VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CHECK (consultation_fee > 0)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_datetime DATETIME NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    status ENUM('booked', 'cancelled') NOT NULL DEFAULT 'booked',
    booked_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME DEFAULT NULL,
    refund_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
    refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,

    -- Cancelled appointments do not occupy the doctor's slot.
    active_slot TINYINT
        GENERATED ALWAYS AS (
            CASE
                WHEN status = 'booked' THEN 1
                ELSE NULL
            END
        ) STORED,

    FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id)
        ON DELETE RESTRICT,

    FOREIGN KEY (doctor_id)
        REFERENCES doctors(doctor_id)
        ON DELETE RESTRICT,

    -- Prevent two active appointments in the same doctor slot.
    UNIQUE KEY unique_doctor_slot (
        doctor_id,
        appointment_datetime,
        active_slot
    ),

    CHECK (amount_paid >= 0),
    CHECK (refund_amount >= 0 AND refund_amount <= amount_paid),
    CHECK (refund_percentage IN (0, 50, 100)),
    CHECK (
        (status = 'booked' AND cancelled_at IS NULL)
        OR
        (status = 'cancelled' AND cancelled_at IS NOT NULL)
    ),
    CHECK (
        TIME(appointment_datetime) >= '09:00:00'
        AND TIME(appointment_datetime) < '17:00:00'
    ),
    CHECK (
        MINUTE(appointment_datetime) IN (0, 30)
        AND SECOND(appointment_datetime) = 0
    )
);
