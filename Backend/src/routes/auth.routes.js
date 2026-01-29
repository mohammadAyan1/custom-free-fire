import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

// Admin Login
router.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const [admins] = await pool.query(
            "SELECT * FROM admins WHERE username = ?",
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const admin = admins[0];
        const validPassword = await bcrypt.compare(password, admin.password_hash);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            token,
            admin: { id: admin.id, username: admin.username }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;