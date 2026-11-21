
const errorMiddleware = (error, req, res, next) => {
    console.error(error.message);

    // Duplicate appointment or other duplicate data
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            message: 'This appointment slot is already booked'
        });
    }

    // Database reference errors
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({
            message: 'Patient or doctor not found'
        });
    }

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
            message: 'Cannot delete this record because it is being used'
        });
    }

    res.status(500).json({
        message: 'Internal server error'
    });
};

module.exports = errorMiddleware;
