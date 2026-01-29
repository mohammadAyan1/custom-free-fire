import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import squadRoutes from "./src/routes/squad.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import nodemailer from "nodemailer";
import pool from "./src/config/db.js";
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter setup
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.use(cors({ origin: ["http://localhost:5173", "https://timely-melba-be0ae6.netlify.app/"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


(async () => {
    try {
        const [rows] = await pool.query("SELECT 1");
        console.log("✅ Aiven MySQL Connected");
    } catch (err) {
        console.error("❌ DB Error:", err.message);
    }
})();


// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/qr", express.static(path.join(__dirname, "public/qr")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/squad", squadRoutes);
app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT} 🚀`);
});