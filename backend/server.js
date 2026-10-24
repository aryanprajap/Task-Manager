require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection Pool Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'taskuser',
  password: process.env.DB_PASSWORD || 'taskpassword',
  database: process.env.DB_NAME || 'taskdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let dbPool = null;

async function initDatabase() {
  try {
    dbPool = mysql.createPool(dbConfig);
    const connection = await dbPool.getConnection();
    console.log(`✅  Successfully connected to MySQL database at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    connection.release();
    app.set('dbPool', dbPool);
  } catch (err) {
    console.warn(`⚠️  Could not connect to MySQL database (${dbConfig.host}:${dbConfig.port}):`, err.message);
    console.warn('⚡  Running in in-memory mode for smooth development & offline testing.');
    app.set('dbPool', null);
  }
}

initDatabase();

// Serve frontend static files (works for standalone local execution)
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/tasks', taskRoutes);

// Health check endpoint (for DevOps container orchestration & CI/CD)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: app.get('dbPool') ? 'mysql-connected' : 'in-memory-fallback',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Only listen if not imported by test runner
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Task Manager Backend running at http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${frontendPath}`);
  });
}

module.exports = app;
