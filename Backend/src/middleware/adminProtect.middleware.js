import jwt from "jsonwebtoken";

export const adminProtect = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided ❌"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin access required ❌"
            });
        }

        // Attach admin info to request
        req.admin = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired ❌"
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token ❌"
            });
        }

        console.error("Admin protect error:", error);
        res.status(500).json({
            success: false,
            message: "Server error ❌"
        });
    }
};