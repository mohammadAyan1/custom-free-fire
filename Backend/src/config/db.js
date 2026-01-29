import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path"

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
