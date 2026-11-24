const fs = require('fs/promises');
const path = require('path');

const logAuditEvent = async (event) => {
    try {
        const logDirectory = path.join(__dirname, '../../logs');
        const logFile = path.join(logDirectory, 'audit.log');

        await fs.mkdir(logDirectory, { recursive: true });

        const logEntry = {
            ...event,
            timestamp: new Date().toISOString()
        };

        await fs.appendFile(
            logFile,
            JSON.stringify(logEntry) + '\n'
        );
    } catch (error) {
        console.error('Audit logging failed:', error.message);
    }
};

module.exports = logAuditEvent;