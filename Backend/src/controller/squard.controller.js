import pool from "../config/db.js";
import { generateRegistrationCode } from "../utils/generateCode.js";
import { sendEmail } from "../utils/emailService.js";
import QRCode from "qrcode";

export const squadCreated = async (req, res) => {
    try {
        const { squadName, leaderIndex, players, leaderEmail, leaderWhatsapp } = req.body;

        // Validate email
        if (!leaderEmail || !leaderEmail.includes('@')) {
            return res.status(400).json({ message: "Valid leader email is required" });
        }

        // Check if squad name exists
        const [exists] = await pool.query(
            "SELECT id FROM squads WHERE squad_name = ?",
            [squadName]
        );
        if (exists.length) {
            return res.status(400).json({ message: "Squad name already exists" });
        }

        // Generate registration code
        const registrationCode = generateRegistrationCode();

        // Parse players data
        const parsedPlayers = JSON.parse(players);
        const screenshots = req.files?.screenshots || [];

        // Insert squad
        const [result] = await pool.query(
            `INSERT INTO squads 
            (squad_name, leader_index, registration_code, leader_email, leader_whatsapp, status, payment_status) 
            VALUES (?, ?, ?, ?, ?, 'pending', 'pending')`,
            [squadName, leaderIndex, registrationCode, leaderEmail, leaderWhatsapp]
        );

        const squadId = result.insertId;

        // Insert players
        for (let i = 0; i < parsedPlayers.length; i++) {
            const p = parsedPlayers[i];
            await pool.query(
                `INSERT INTO squad_players 
                (squad_id, player_index, name, whatsapp, uid, username, screenshot) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    squadId,
                    i,
                    p.name,
                    p.whatsapp,
                    p.uid,
                    p.username,
                    screenshots[i] ? `/uploads/squad/${screenshots[i].filename}` : null,
                ]
            );
        }

        // Send registration email
        await sendEmail({
            to: leaderEmail,
            subject: "Squad Registration Successful - Free Fire Tournament",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff6b00;">🎮 Free Fire Tournament Registration Successful!</h2>
                    <p>Dear ${parsedPlayers[leaderIndex]?.name || 'Leader'},</p>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>Registration Details:</h3>
                        <p><strong>Squad Name:</strong> ${squadName}</p>
                        <p><strong>Registration Code:</strong> <code style="background: #333; color: white; padding: 5px 10px; border-radius: 5px;">${registrationCode}</code></p>
                        <p><strong>Leader:</strong> ${parsedPlayers[leaderIndex]?.name}</p>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>📌 Important Next Steps:</h3>
                        <ol>
                            <li>Complete payment of ₹200 to confirm your spot</li>
                            <li>Upload payment screenshot using your registration code</li>
                            <li>Wait for admin approval</li>
                            <li>You'll receive match details via email</li>
                        </ol>
                    </div>
                    
                    <p>Use this registration code to check your status anytime.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p>Best regards,<br>Tournament Team</p>
                    </div>
                </div>
            `
        });

        res.json({
            message: "Squad Registered Successfully ✅",
            registrationCode,
            nextStep: "Complete payment to confirm registration"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const uploadPayment = async (req, res) => {
    try {
        const { code } = req.params;
        const paymentFile = req.file;

        if (!paymentFile) {
            return res.status(400).json({ message: "Payment screenshot is required" });
        }

        // Update squad payment status
        const [result] = await pool.query(
            `UPDATE squads 
            SET payment_screenshot = ?, payment_status = 'paid', payment_date = NOW() 
            WHERE registration_code = ?`,
            [`/uploads/payment/${paymentFile.filename}`, code]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Invalid registration code" });
        }

        // Get squad details for email
        const [squads] = await pool.query(
            "SELECT * FROM squads WHERE registration_code = ?",
            [code]
        );

        const squad = squads[0];

        // Send payment confirmation email
        await sendEmail({
            to: squad.leader_email,
            subject: "Payment Received - Free Fire Tournament",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">✅ Payment Received Successfully!</h2>
                    <p>Dear Leader,</p>
                    
                    <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>Payment Confirmation:</h3>
                        <p><strong>Squad Name:</strong> ${squad.squad_name}</p>
                        <p><strong>Registration Code:</strong> ${squad.registration_code}</p>
                        <p><strong>Payment Status:</strong> <span style="color: #28a745;">Paid</span></p>
                        <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Amount:</strong> ₹200</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>📋 What's Next?</h3>
                        <p>Your payment has been received and is under verification. 
                        We will review your registration and update the status within 24 hours.</p>
                        <p>You will receive another email with match details once approved.</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        <em>Keep your registration code safe for future reference.</em>
                    </p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p>Best regards,<br>Tournament Team</p>
                    </div>
                </div>
            `
        });

        res.json({
            message: "Payment uploaded successfully ✅",
            status: "Under verification"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getSquadByUser = async (req, res) => {
    try {
        const { code } = req.params;

        const [squads] = await pool.query(
            `SELECT s.*, 
            (SELECT COUNT(*) FROM squad_players WHERE squad_id = s.id) as total_players
            FROM squads s 
            WHERE registration_code = ?`,
            [code]
        );

        if (squads.length === 0) {
            return res.status(404).json({ message: "Invalid registration code" });
        }

        const squad = squads[0];

        const [players] = await pool.query(
            "SELECT * FROM squad_players WHERE squad_id = ? ORDER BY player_index",
            [squad.id]
        );

        res.json({
            success: true,
            squad: {
                ...squad,
                players
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const checkSquadStatus = async (req, res) => {
    try {
        const { code } = req.params;

        const [squads] = await pool.query(
            `SELECT 
                squad_name,
                registration_code,
                status,
                payment_status,
                payment_screenshot,
                remark,
                room_id,
                room_password,
                created_at
            FROM squads 
            WHERE registration_code = ?`,
            [code]
        );

        if (squads.length === 0) {
            return res.status(404).json({ message: "Invalid registration code" });
        }

        res.json({ success: true, data: squads[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Other functions remain same...
export const getSquadByCode = async (req, res) => {
    const [squad] = await pool.query(
        "SELECT * FROM squads WHERE registration_code=?",
        [req.params.code]
    );

    if (!squad.length) {
        return res.status(404).json({ message: "Invalid code ❌" });
    }

    const [players] = await pool.query(
        "SELECT * FROM squad_players WHERE squad_id=?",
        [squad[0].id]
    );

    res.json({ squad: squad[0], players });
};