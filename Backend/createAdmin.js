// import bcrypt from 'bcrypt';
// import mysql from 'mysql2/promise';
// import dotenv from "dotenv";
// import path from "path"


// dotenv.config({
//     path: path.resolve(process.cwd(), ".env")
// });

// const createAdmin = async () => {
//     try {
//         const connection = await mysql.createConnection({
//             host: process.env.DB_HOST,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD,
//             database: process.env.DB_NAME
//         });

//         // Create admins table if not exists
//         await connection.execute(`
//     CREATE TABLE IF NOT EXISTS admins (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         username VARCHAR(50) UNIQUE NOT NULL,
//         password_hash VARCHAR(255) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
// `);


//         // Hash password (admin123)
//         const password = 'admin123';
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Insert admin
//         const [result] = await connection.execute(
//             'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
//             ['admin', hashedPassword]
//         );

//         console.log('✅ Admin created successfully!');
//         console.log(`👤 Username: admin`);
//         console.log(`🔑 Password: admin123`);
//         console.log(`🎯 Role: super_admin`);
//         console.log(`🆔 Admin ID: ${result.insertId}`);

//         await connection.end();
//     } catch (error) {
//         console.error('❌ Error creating admin:', error);
//     }
// };

// createAdmin();



import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import pool from "./src/config/db.js";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const createAdmin = async () => {
  try {
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO admins (username, password_hash, role)
       VALUES (?, ?, 'admin')`,
      ["admin", hashedPassword]
    );

    console.log("✅ Admin created successfully!");
    console.log("👤 Username: admin");
    console.log("🔑 Password: admin123");
    console.log("🆔 Admin ID:", result.insertId);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
