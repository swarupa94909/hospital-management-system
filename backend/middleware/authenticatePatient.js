const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');

const authenticatePatient = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                error: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const patient = await Patient.findById(decoded.patientId);

        if (!patient) {
            return res.status(401).json({
                error: 'Invalid token.'
            });
        }

        req.patient = patient;

        next();
    } catch (err) {
        console.error('Patient authentication error:', err);

        return res.status(401).json({
            error: 'Invalid token.'
        });
    }
};

module.exports = authenticatePatient;
