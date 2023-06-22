const express = require('express')
const app = express();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Voter = require('../models/voter/voter.model');
// Apply cookie-parser middleware
app.use(cookieParser());
exports.authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Access denied, no token provided',
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

            const voter = await Voter.findById(decoded._id);

            if (!voter) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: 'Voter not found',
                });
            }

            req.user = voter; // Set the authenticated user in req.user

            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: 'Invalid token',
                });
            }

            console.log(error);
            res.status(500).json({
                message: 'Internal server error',
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
};
