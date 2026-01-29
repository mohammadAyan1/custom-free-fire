import pool from "./db.js";

const createTables = async () => {
  try {
    await pool.query(`SET FOREIGN_KEY_CHECKS = 0`);

    await pool.query(/* admins */ `
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(/* squads */ `
      CREATE TABLE IF NOT EXISTS squads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        squad_name VARCHAR(150) NOT NULL,
        leader_index INT DEFAULT 0,
        registration_code VARCHAR(20) UNIQUE,
        payment_screenshot VARCHAR(255),
        payment_date TIMESTAMP NULL,
        status ENUM('pending','approved','rejected') DEFAULT 'pending',
        payment_status ENUM('pending','paid','rejected') DEFAULT 'pending',
        remark TEXT,
        leader_email VARCHAR(150),
        leader_whatsapp VARCHAR(20),
        room_id VARCHAR(50),
        room_password VARCHAR(50),
        match_time DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(/* squad_players */ `
      CREATE TABLE IF NOT EXISTS squad_players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        squad_id INT NOT NULL,
        player_index INT NOT NULL,
        name VARCHAR(100),
        whatsapp VARCHAR(20),
        uid VARCHAR(50),
        username VARCHAR(100),
        screenshot VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE
      )
    `);

    await pool.query(/* payments */ `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        squad_id INT,
        amount DECIMAL(10,2),
        transaction_id VARCHAR(100),
        payment_method VARCHAR(50),
        screenshot VARCHAR(255),
        status ENUM('pending','success','failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE
      )
    `);

    await pool.query(/* email_logs */ `
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        squad_id INT,
        email_type VARCHAR(50),
        subject VARCHAR(200),
        sent_to VARCHAR(150),
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE
      )
    `);

    await pool.query(/* email_templates */ `
      CREATE TABLE IF NOT EXISTS email_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_type VARCHAR(50) UNIQUE,
        subject VARCHAR(200),
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(/* activity_logs */ `
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT,
        action VARCHAR(100),
        table_name VARCHAR(50),
        record_id INT,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
      )
    `);

    await pool.query(`SET FOREIGN_KEY_CHECKS = 1`);

    console.log("✅ ALL TABLES CREATED SUCCESSFULLY");
    process.exit(0);
  } catch (err) {
    console.error("❌ TABLE CREATION FAILED:", err.message);
    process.exit(1);
  }
};

createTables();
