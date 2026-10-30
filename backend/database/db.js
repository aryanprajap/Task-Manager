/**
 * Database Connection Module (MySQL 8.0)
 * Uses mysql2/promise connection pool
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'taskuser',
  password: process.env.DB_PASSWORD || 'taskpass',
  database: process.env.DB_NAME || 'taskmanager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 3000
};

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('⚠️  Failed to create MySQL pool:', err.message);
}

// Test connection on startup
async function testConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    console.log(`✅  Successfully connected to MySQL database at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    connection.release();
    isConnected = true;
    return true;
  } catch (err) {
    console.warn(`⚠️  Could not connect to MySQL database (${dbConfig.host}:${dbConfig.port}): ${err.message}`);
    console.warn('⚡  Running in in-memory mode for smooth development & testing.');
    isConnected = false;
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  getIsConnected: () => isConnected,
  dbConfig
};
