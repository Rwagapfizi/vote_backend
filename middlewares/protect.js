const jwt = require('jsonwebtoken');
const { User } = require('../models/user/user.model');

exports.protect = async (req, res, next) => {
    try {
        // Get token from header or cookies
        const token = req.headers.authorization || req.cookies.token;

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Access denied, no token provided',
            });
        }

        // Check token format
        if (!token.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Access Denied',
            });
        }

        // Verify the token
        const tokenString = token.split(' ')[1];
        try {
            const decoded = jwt.verify(tokenString, process.env.SECRET_KEY);

            // Check if user exists
            const user = await User.findById(decoded._id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: 'User not found',
                });
            }

            // Set the user in the request object
            req.user = user;
            next();
        } catch (error) {
            // Handle the specific error when the token is invalid
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({
                    success: false,
                    status: 401,
                    message: 'Invalid token',
                });
            }

            // Handle other errors
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
