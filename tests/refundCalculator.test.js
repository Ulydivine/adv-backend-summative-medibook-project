const calculateRefund = require('../src/utils/refundCalculator');

describe('Refund calculator', () => {
    test('gives a 100% refund when cancelled more than 48 hours before', () => {
        const result = calculateRefund(100, 49 * 60 * 60);

        expect(result.refund_percentage).toBe(100);
        expect(result.refund_amount).toBe(100);
    });

    test('gives a 50% refund when cancelled exactly 48 hours before', () => {
        const result = calculateRefund(100, 48 * 60 * 60);

        expect(result.refund_percentage).toBe(50);
        expect(result.refund_amount).toBe(50);
    });

    test('gives a 50% refund when cancelled between 24 and 48 hours before', () => {
        const result = calculateRefund(100, 36 * 60 * 60);

        expect(result.refund_percentage).toBe(50);
        expect(result.refund_amount).toBe(50);
    });

 test('gives a 50% refund when cancelled exactly 24 hours before', () => {
    const result = calculateRefund(100, 24 * 60 * 60);

    expect(result.refund_percentage).toBe(50);
    expect(result.refund_amount).toBe(50);
});

    test('gives a 0% refund when cancelled less than 24 hours before', () => {
        const result = calculateRefund(100, 12 * 60 * 60);

        expect(result.refund_percentage).toBe(0);
        expect(result.refund_amount).toBe(0);
    });
});