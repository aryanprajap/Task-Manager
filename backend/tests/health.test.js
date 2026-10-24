const http = require('http');
const assert = require('assert');
const app = require('../server');

const TEST_PORT = 3001;

console.log('🧪 Running automated CI/CD unit & health tests...');

const server = app.listen(TEST_PORT, () => {
  http.get(`http://localhost:${TEST_PORT}/api/health`, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(rawData);
        assert.strictEqual(res.statusCode, 200, 'Expected status code 200');
        assert.strictEqual(parsed.status, 'healthy', 'Expected healthy status in API response');
        console.log('✅ Health check endpoint test passed [200 OK]');
        
        // Test GET /api/tasks
        http.get(`http://localhost:${TEST_PORT}/api/tasks`, (tasksRes) => {
          let tasksData = '';
          tasksRes.on('data', (chunk) => { tasksData += chunk; });
          tasksRes.on('end', () => {
            const tasksParsed = JSON.parse(tasksData);
            assert.strictEqual(tasksRes.statusCode, 200, 'Expected status code 200 for tasks');
            assert.strictEqual(tasksParsed.success, true, 'Expected success=true for tasks');
            console.log('✅ Tasks list endpoint test passed [200 OK]');
            console.log('🎉 All automated CI tests passed successfully!');
            server.close(() => process.exit(0));
          });
        });
      } catch (err) {
        console.error('❌ Test failed:', err.message);
        server.close(() => process.exit(1));
      }
    });
  }).on('error', (err) => {
    console.error('❌ Connection error during test:', err.message);
    server.close(() => process.exit(1));
  });
});
