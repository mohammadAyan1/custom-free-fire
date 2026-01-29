import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `"Free Fire Tournament" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Email error:", error);
        return false;
    }
};

export const sendRegistrationEmail = async (squadData) => {
    const { leaderEmail, squadName, registrationCode, leaderName } = squadData;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .code { background: #333; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-size: 24px; letter-spacing: 3px; margin: 20px 0; }
                .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎮 Free Fire Tournament Registration</h1>
                    <p>Your squad has been successfully registered!</p>
                </div>
                <div class="content">
                    <h2>Hello ${leaderName}!</h2>
                    
                    <div class="info-box">
                        <h3>Registration Details:</h3>
                        <p><strong>Squad Name:</strong> ${squadName}</p>
                        <p><strong>Registration Code:</strong></p>
                        <div class="code">${registrationCode}</div>
                        <p><em>Keep this code safe for future reference!</em></p>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>📌 Next Steps:</h3>
                        <ol>
                            <li>Complete payment of ₹200</li>
                            <li>Upload payment screenshot using your registration code</li>
                            <li>Wait for admin verification</li>
                            <li>Receive match details via email</li>
                        </ol>
                    </div>
                    
                    <p>You can check your registration status anytime by visiting our portal and entering your registration code.</p>
                    
                    <div class="footer">
                        <p>Best regards,<br>
                        <strong>Free Fire Tournament Team</strong></p>
                        <p style="font-size: 12px; color: #999;">
                            This is an automated email. Please do not reply to this message.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: leaderEmail,
        subject: `Squad Registration Successful - ${squadName}`,
        html
    });
};