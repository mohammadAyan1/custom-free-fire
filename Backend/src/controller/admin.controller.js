import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/emailService.js";

// Admin login with secret code
export const adminLogin = async (req, res) => {
    try {
        const { username, password, adminCode } = req.body;

        // Check admin code
        if (adminCode !== process.env.ADMIN_CODE) {
            return res.status(401).json({
                message: "Invalid admin code ❌"
            });
        }

        // Find admin
        const [admins] = await pool.query(
            "SELECT * FROM admins WHERE username = ?",
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                message: "Invalid credentials ❌"
            });
        }

        const admin = admins[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid credentials ❌"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            success: true,
            message: "Login successful ✅",
            token,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            message: "Server error ❌"
        });
    }
};

// Get all squads with filters
export const adminGetAll = async (req, res) => {
    try {
        const { status, payment_status, search, page = 1, limit = 20 } = req.query;

        let query = `
            SELECT 
                s.*,
                (SELECT COUNT(*) FROM squad_players WHERE squad_id = s.id) as total_players,
                (SELECT name FROM squad_players WHERE squad_id = s.id AND player_index = s.leader_index) as leader_name
            FROM squads s
            WHERE 1=1
        `;

        const params = [];

        // Apply filters
        if (status && status !== 'all') {
            query += " AND s.status = ?";
            params.push(status);
        }

        if (payment_status && payment_status !== 'all') {
            query += " AND s.payment_status = ?";
            params.push(payment_status);
        }

        if (search) {
            query += " AND (s.squad_name LIKE ? OR s.registration_code LIKE ? OR s.leader_email LIKE ?)";
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Count total records for pagination
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Apply pagination
        query += " ORDER BY s.created_at DESC LIMIT ? OFFSET ?";
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), parseInt(offset));

        const [squads] = await pool.query(query, params);

        res.json({
            success: true,
            data: squads,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get all squads error:", error);
        res.status(500).json({
            success: false,
            message: "Server error ❌"
        });
    }
};

// Get detailed squad information
export const getSquadDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Get squad details
        const [squads] = await pool.query(
            `SELECT 
                s.*,
                (SELECT name FROM squad_players WHERE squad_id = s.id AND player_index = s.leader_index) as leader_name
            FROM squads s 
            WHERE s.id = ?`,
            [id]
        );

        if (squads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Squad not found ❌"
            });
        }

        const squad = squads[0];

        // Get all players
        const [players] = await pool.query(
            "SELECT * FROM squad_players WHERE squad_id = ? ORDER BY player_index",
            [id]
        );

        // Get payment history if exists
        const [payments] = await pool.query(
            "SELECT * FROM payments WHERE squad_id = ? ORDER BY created_at DESC",
            [id]
        );

        res.json({
            success: true,
            data: {
                ...squad,
                players,
                payments
            }
        });
    } catch (error) {
        console.error("Get squad details error:", error);
        res.status(500).json({
            success: false,
            message: "Server error ❌"
        });
    }
};

// Update squad status
export const adminUpdateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remark, roomId, roomPassword, payment_status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'approved', 'rejected'];
        const validPaymentStatuses = ['pending', 'paid', 'rejected'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status ❌"
            });
        }

        if (payment_status && !validPaymentStatuses.includes(payment_status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status ❌"
            });
        }

        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];

        if (status) {
            updateFields.push("status = ?");
            updateValues.push(status);
        }

        if (payment_status) {
            updateFields.push("payment_status = ?");
            updateValues.push(payment_status);
        }

        if (remark !== undefined) {
            updateFields.push("remark = ?");
            updateValues.push(remark);
        }

        if (roomId !== undefined) {
            updateFields.push("room_id = ?");
            updateValues.push(roomId);
        }

        if (roomPassword !== undefined) {
            updateFields.push("room_password = ?");
            updateValues.push(roomPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update ❌"
            });
        }

        updateValues.push(id);

        const query = `UPDATE squads SET ${updateFields.join(", ")} WHERE id = ?`;

        const [result] = await pool.query(query, updateValues);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Squad not found ❌"
            });
        }

        // If status changed to approved, send email
        if (status === 'approved') {
            await sendApprovalEmail(id, roomId, roomPassword);
        }

        // If payment status changed, send email
        if (payment_status === 'paid') {
            await sendPaymentConfirmationEmail(id);
        }

        res.json({
            success: true,
            message: "Squad updated successfully ✅"
        });
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({
            success: false,
            message: "Server error ❌"
        });
    }
};

// Send custom email to squad
export const sendEmailToSquad = async (req, res) => {
    try {
        const { squadId } = req.params;
        const { subject, message, emailType } = req.body;

        // Get squad details
        const [squads] = await pool.query(
            `SELECT s.*, 
             (SELECT name FROM squad_players WHERE squad_id = s.id AND player_index = s.leader_index) as leader_name
             FROM squads s WHERE id = ?`,
            [squadId]
        );

        if (squads.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Squad not found ❌"
            });
        }

        const squad = squads[0];

        let emailSubject = subject;
        let emailMessage = message;

        // Use template if emailType is specified
        if (emailType) {
            const template = await getEmailTemplate(emailType, squad);
            emailSubject = template.subject;
            emailMessage = template.message;
        }

        // Send email
        const emailSent = await sendEmail({
            to: squad.leader_email,
            subject: emailSubject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>🎮 Free Fire Tournament</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2>Hello ${squad.leader_name || 'Leader'}!</h2>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                            ${emailMessage.replace(/\n/g, '<br>')}
                        </div>
                        
                        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <p><strong>Squad Details:</strong></p>
                            <p>Squad Name: ${squad.squad_name}</p>
                            <p>Registration Code: <code style="background: #333; color: white; padding: 2px 8px; border-radius: 4px;">${squad.registration_code}</code></p>
                            <p>Status: ${squad.status}</p>
                            ${squad.room_id ? `<p>Room ID: ${squad.room_id}</p>` : ''}
                            ${squad.room_password ? `<p>Room Password: ${squad.room_password}</p>` : ''}
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                            <p>Best regards,<br><strong>Tournament Team</strong></p>
                            <p style="font-size: 12px; color: #999;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        if (emailSent) {
            // Log email sent
            await pool.query(
                "INSERT INTO email_logs (squad_id, email_type, subject, sent_to) VALUES (?, ?, ?, ?)",
                [squadId, emailType || 'custom', emailSubject, squad.leader_email]
            );

            res.json({
                success: true,
                message: "Email sent successfully ✅"
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to send email ❌"
            });
        }
    } catch (error) {
        console.error("Send email error:", error);
        res.status(500).json({
            success: false,
            message: "Server error ❌"
        });
    }
};

// Helper function to get email template
const getEmailTemplate = async (templateType, squad) => {
    try {
        const [templates] = await pool.query(
            "SELECT subject, body FROM email_templates WHERE template_type = ?",
            [templateType]
        );

        if (templates.length > 0) {
            let subject = templates[0].subject;
            let body = templates[0].body;

            // Replace placeholders with actual data
            const replacements = {
                '{squad_name}': squad.squad_name,
                '{registration_code}': squad.registration_code,
                '{leader_name}': squad.leader_name || 'Leader',
                '{status}': squad.status,
                '{room_id}': squad.room_id || 'Not assigned',
                '{room_password}': squad.room_password || 'Not assigned',
                '{match_time}': squad.match_time || 'Will be announced'
            };

            for (const [key, value] of Object.entries(replacements)) {
                subject = subject.replace(key, value);
                body = body.replace(key, value);
            }

            return { subject, message: body };
        }
    } catch (error) {
        console.error("Get template error:", error);
    }

    // Default templates
    const defaultTemplates = {
        'approval': {
            subject: `Registration Approved - ${squad.squad_name}`,
            message: `Congratulations! Your squad "${squad.squad_name}" has been approved for the tournament.\n\nMatch Details:\n- Room ID: ${squad.room_id || 'Will be announced'}\n- Room Password: ${squad.room_password || 'Will be announced'}\n- Please join 15 minutes before the scheduled time.\n\nRegistration Code: ${squad.registration_code}\n\nBest regards,\nTournament Team`
        },
        'payment_received': {
            subject: `Payment Received - ${squad.squad_name}`,
            message: `We have received your payment for squad "${squad.squad_name}".\n\nPayment Details:\n- Amount: ₹200\n- Status: Verified\n- Date: ${new Date().toLocaleDateString()}\n\nYour registration is now complete! We will review your submission and update the status within 24 hours.\n\nRegistration Code: ${squad.registration_code}\n\nBest regards,\nTournament Team`
        },
        'rejection': {
            subject: `Registration Update - ${squad.squad_name}`,
            message: `Regarding your squad "${squad.squad_name}", we regret to inform you that your registration has been rejected.\n\nReason: ${squad.remark || 'Not specified'}\n\nRegistration Code: ${squad.registration_code}\n\nIf you believe this is a mistake, please contact support.\n\nBest regards,\nTournament Team`
        }
    };

    return defaultTemplates[templateType] || {
        subject: `Update - ${squad.squad_name}`,
        message: 'Important update regarding your squad registration.'
    };
};

// Helper function to send approval email
const sendApprovalEmail = async (squadId, roomId, roomPassword) => {
    try {
        const [squads] = await pool.query(
            `SELECT s.*, 
             (SELECT name FROM squad_players WHERE squad_id = s.id AND player_index = s.leader_index) as leader_name
             FROM squads s WHERE id = ?`,
            [squadId]
        );

        if (squads.length === 0) return;

        const squad = squads[0];

        await sendEmail({
            to: squad.leader_email,
            subject: `🎉 Registration Approved - ${squad.squad_name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>🎮 Registration Approved!</h1>
                        <p>Your squad has been approved for the tournament!</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2>Congratulations ${squad.leader_name}!</h2>
                        
                        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                            <h3 style="margin-top: 0; color: #155724;">✅ Registration Approved</h3>
                            <p>Your squad <strong>${squad.squad_name}</strong> has been approved for the Free Fire Tournament!</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h3 style="color: #333; margin-top: 0;">📋 Match Details</h3>
                            ${roomId ? `<p><strong>Room ID:</strong> <code style="background: #333; color: white; padding: 5px 10px; border-radius: 4px; font-size: 18px;">${roomId}</code></p>` : '<p>Room ID: Will be announced soon</p>'}
                            ${roomPassword ? `<p><strong>Room Password:</strong> <code style="background: #333; color: white; padding: 5px 10px; border-radius: 4px; font-size: 18px;">${roomPassword}</code></p>` : '<p>Room Password: Will be announced soon</p>'}
                            <p><strong>Registration Code:</strong> <code style="background: #333; color: white; padding: 5px 10px; border-radius: 4px;">${squad.registration_code}</code></p>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #856404; margin-top: 0;">⚠️ Important Instructions</h4>
                            <ol>
                                <li>Please join the room <strong>15 minutes</strong> before the scheduled match time</li>
                                <li>Ensure all squad members are ready with their devices</li>
                                <li>Keep your registration code handy for verification</li>
                                <li>Follow all tournament rules for fair play</li>
                            </ol>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                            <p>Best regards,<br><strong>Tournament Team</strong></p>
                            <p style="font-size: 12px; color: #999;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        // Log email
        await pool.query(
            "INSERT INTO email_logs (squad_id, email_type, subject, sent_to) VALUES (?, 'approval', ?, ?)",
            [squadId, `Registration Approved - ${squad.squad_name}`, squad.leader_email]
        );

    } catch (error) {
        console.error("Send approval email error:", error);
    }
};

// Helper function to send payment confirmation email
const sendPaymentConfirmationEmail = async (squadId) => {
    try {
        const [squads] = await pool.query(
            `SELECT s.*, 
             (SELECT name FROM squad_players WHERE squad_id = s.id AND player_index = s.leader_index) as leader_name
             FROM squads s WHERE id = ?`,
            [squadId]
        );

        if (squads.length === 0) return;

        const squad = squads[0];

        await sendEmail({
            to: squad.leader_email,
            subject: `✅ Payment Verified - ${squad.squad_name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #20c997 0%, #28a745 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1>💰 Payment Verified!</h1>
                        <p>Your payment has been confirmed successfully</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2>Hello ${squad.leader_name}!</h2>
                        
                        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                            <h3 style="margin-top: 0; color: #155724;">✅ Payment Confirmed</h3>
                            <p>We have successfully verified your payment for squad <strong>${squad.squad_name}</strong>.</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h3 style="color: #333; margin-top: 0;">📄 Payment Details</h3>
                            <p><strong>Amount:</strong> ₹200</p>
                            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">VERIFIED</span></p>
                            <p><strong>Verification Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Registration Code:</strong> <code style="background: #333; color: white; padding: 5px 10px; border-radius: 4px;">${squad.registration_code}</code></p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #333; margin-top: 0;">📋 What's Next?</h4>
                            <p>Your payment has been verified. Now your registration is complete!</p>
                            <p>We will review your squad details and update the registration status within 24 hours.</p>
                            <p>You will receive another email once your squad is approved for the tournament.</p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                            <p>Best regards,<br><strong>Tournament Team</strong></p>
                            <p style="font-size: 12px; color: #999;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        // Log email
        await pool.query(
            "INSERT INTO email_logs (squad_id, email_type, subject, sent_to) VALUES (?, 'payment_confirmation', ?, ?)",
            [squadId, `Payment Verified - ${squad.squad_name}`, squad.leader_email]
        );

    } catch (error) {
        console.error("Send payment confirmation email error:", error);
    }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Get total squads
        const [totalResult] = await pool.query("SELECT COUNT(*) as total FROM squads");

        // Get squads by status
        const [statusResult] = await pool.query(
            "SELECT status, COUNT(*) as count FROM squads GROUP BY status"
        );

        // Get squads by payment status
        const [paymentResult] = await pool.query(
            "SELECT payment_status, COUNT(*) as count FROM squads GROUP BY payment_status"
        );

        // Get recent registrations (last 7 days)
        const [recentResult] = await pool.query(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM squads 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date DESC`
        );

        // Get today's registrations
        const [todayResult] = await pool.query(
            "SELECT COUNT(*) as count FROM squads WHERE DATE(created_at) = CURDATE()"
        );

        res.json({
            success: true,
            data: {
                total: totalResult[0].total,
                byStatus: statusResult,
                byPaymentStatus: paymentResult,
                recentRegistrations: recentResult,
                today: todayResult[0].count
            }
        });
    } catch (error) {
        console.error("Get dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Server error ❌"
        });
    }
};