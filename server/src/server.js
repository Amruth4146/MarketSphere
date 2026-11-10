import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { checkElasticConnection } from './config/elasticsearch.js';

const startServer = async () => {
  // Attempt service connections
  await connectDB();
  await connectRedis();
  await checkElasticConnection();

  const server = app.listen(config.port, () => {
    console.log(`[MarketSphere Server] Running on http://localhost:${config.port}`);
    console.log(`[MarketSphere Server] Environment: ${config.nodeEnv}`);
  });

  const handleShutdown = (signal) => {
    console.log(`[MarketSphere Server] Received ${signal}, closing server gracefully...`);
    server.close(() => {
      console.log('[MarketSphere Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();

