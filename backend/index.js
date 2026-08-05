const app = require('./src/app');
const env = require('./src/config/env');
const {
  pool,
  testDatabaseConnection,
} = require('./src/config/db');

let server;

async function startServer() {
  try {
    await testDatabaseConnection();

    server = app.listen(env.port, () => {
      console.log(`LearnHub API running at http://localhost:${env.port}`);
      console.log(
        `Health check: http://localhost:${env.port}/api/health`
      );
    });
  } catch (error) {
    console.error('Failed to start LearnHub API:', error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);

  if (server) {
    server.close(async () => {
      await pool.end();
      console.log('Server and database connections closed');
      process.exit(0);
    });
  } else {
    await pool.end();
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
