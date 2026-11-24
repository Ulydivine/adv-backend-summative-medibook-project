const validateAppointmentDateTime = require('../src/utils/appointmentValidation');

describe('Appointment date and time validation', () => {
    const now = new Date('2026-11-24T08:00:00');

    test('accepts a future appointment during working hours', () => {
        const result = validateAppointmentDateTime(
            '2026-11-25 10:00:00',
            now
        );

        expect(result).toBeNull();
    });

    test('rejects an appointment in the past', () => {
        const result = validateAppointmentDateTime(
            '2026-11-23 10:00:00',
            now
        );

        expect(result.status).toBe(422);
    });

    test('rejects an appointment outside working hours', () => {
        const result = validateAppointmentDateTime(
            '2026-11-25 08:30:00',
            now
        );

        expect(result.status).toBe(422);
    });

    test('rejects a time that is not on a 30-minute slot', () => {
        const result = validateAppointmentDateTime(
            '2026-11-25 10:15:00',
            now
        );

        expect(result.status).toBe(422);
    });
});