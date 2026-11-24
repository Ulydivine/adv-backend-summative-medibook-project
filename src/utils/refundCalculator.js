const calculateRefund = (amountPaid, secondsUntil) => {
    let refundPercentage = 0;

    if (secondsUntil > 48 * 60 * 60) {
        refundPercentage = 100;
    } else if (secondsUntil >= 24 * 60 * 60) {
        refundPercentage = 50;
    }

    const refundAmount = Number(
        (Number(amountPaid) * refundPercentage / 100).toFixed(2)
    );

    return {
        refund_percentage: refundPercentage,
        refund_amount: refundAmount
    };
};

module.exports = calculateRefund;