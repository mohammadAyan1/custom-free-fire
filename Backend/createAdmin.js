

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import pool from "./src/config/db.js";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// const createAdmin = async () => {
//   try {
//     const password = "admin123";
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const [result] = await pool.execute(
//       `INSERT INTO admins (username, password_hash, role)
//        VALUES (?, ?, 'admin')`,
//       ["admin", hashedPassword]
//     );

//     console.log("✅ Admin created successfully!");
//     console.log("👤 Username: admin");
//     console.log("🔑 Password: admin123");
//     console.log("🆔 Admin ID:", result.insertId);

//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Error creating admin:", error.message);
//     process.exit(1);
//   }
// };

// createAdmin();





const seedEmailTemplates = async () => {
  try {
    const sql = `
      INSERT INTO email_templates
      (template_type, subject, body)
      VALUES
      (?, ?, ?),
      (?, ?, ?),
      (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        subject = VALUES(subject),
        body = VALUES(body);
    `;

    const values = [
      // registration_success
      "registration_success",
      "Squad Registration Successful - Free Fire Tournament",
      `Dear {leader_name},

Your squad "{squad_name}" has been successfully registered for the Free Fire Tournament!

Registration Details:
- Squad Name: {squad_name}
- Registration Code: {registration_code}
- Status: {status}

Please complete your payment of ₹200 to confirm your participation.

Payment Details:
- UPI ID: tournament@upi
- QR Code: [Attached in next email]
- Amount: ₹200

After payment, upload the screenshot on the registration portal.

Best regards,
Tournament Team`,

      // payment_success
      "payment_success",
      "Payment Received - Free Fire Tournament",
      `Dear {leader_name},

We have received your payment for squad "{squad_name}".

Payment Details:
- Amount: ₹200
- Date: {payment_date}
- Status: Verified

Your registration is now complete! We will review your submission and update the status within 24 hours.

Registration Code: {registration_code}

Best regards,
Tournament Team`,

      // approval_status
      "approval_status",
      "Registration Approved - Free Fire Tournament",
      `Congratulations {leader_name}!

Your squad "{squad_name}" has been approved for the Free Fire Tournament!

Match Details:
- Room ID: {room_id}
- Room Password: {room_password}
- Match Time: {match_time}
- Registration Code: {registration_code}

Please join 15 minutes before the scheduled time.

Best regards,
Tournament Team`
    ];

    await pool.query(sql, values);

    console.log("✅ Email templates inserted / updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed email templates:", error.message);
    process.exit(1);
  }
};

seedEmailTemplates();
