
require('dotenv').config();

const express = require('express');
const pool = require('./src/config/database');
const redisClient = require('./src/config/redis');
const errorMiddleware = require('./src/middleware/errorMiddleware');

const app = express();

app.use(express.json());

const patientRoutes = require('./src/routes/patientRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');

app.use('/patients', patientRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/feedback', feedbackRoutes);

// Basic route to check if the API is running
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'MediBook API is running'
    });
});

// Handle errors from all routes
app.use(errorMiddleware);

// Start the server and connect to MySQL and Redis
const startServer = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Connected to MySQL');

        await redisClient.connect();
        console.log('Connected to Redis');

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Could not start the server:', error.message);
    }
};

startServer();

