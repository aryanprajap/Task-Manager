require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database module
const db = require('./database/db');

// Test database connection
db.testConnection().then(connected => {
  app.set('dbPool', connected ? db.pool : null);
});

// Serve frontend static files
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

// Helper function to start server with automatic port retry if port is busy
function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`\n🚀 Task Manager Backend running at: http://localhost:${portToTry}`);
    console.log(`📁 Serving frontend UI from:      ${frontendPath}`);
    console.log(`📡 API Health Check endpoint:    http://localhost:${portToTry}/api/health`);
    console.log(`📋 Tasks REST API endpoint:       http://localhost:${portToTry}/api/tasks\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${portToTry} is in use (macOS AirPlay / ControlCenter frequently uses 5000).`);
      const nextPort = portToTry === 5000 ? 5001 : (portToTry === 5001 ? 3000 : portToTry + 1);
      console.log(`🔄 Automatically switching to port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('❌ Server startup error:', err);
    }
  });
}

// Only start listening if executed directly (not imported during tests)
if (require.main === module) {
  startServer(PORT);
}

module.exports = app;
