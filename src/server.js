import { createApp } from './app.js';
import config from './config/env.js';
import { getDatabase, getSettings } from './database/db.js';

async function startServer() {
  console.log('===========================================================');
  console.log('  🌦️  WeatherGPT — Production Full-Stack Server');
  console.log('===========================================================');

  try {
    getDatabase();
    console.log('[db] SQLite database initialized successfully.');
  } catch (err) {
    console.error('[db] Fatal error initializing SQLite database:', err);
    process.exit(1);
  }

  const settings = getSettings();
  const hasGeminiKey = Boolean(config.gemini.apiKey || (settings.gemini_api_key && settings.gemini_api_key.trim().length > 5));

  console.log(`[config] Node.js Runtime: ${process.version}`);
  console.log(`[config] Environment: ${config.env}`);
  console.log(`[ai] Gemini AI Integration: ${hasGeminiKey ? 'ACTIVE (' + config.gemini.model + ')' : 'READY (Heuristic fallback active - Add key in Settings)'}`);

  const app = createApp();
  const server = app.listen(config.port, config.host, () => {
    console.log('-----------------------------------------------------------');
    console.log(`🚀 WeatherGPT is running at: http://localhost:${config.port}`);
    console.log(`📡 Local Network: http://${config.host}:${config.port}`);
    console.log(`🛡️ Rate limiting: ${config.rateLimit.maxRequests} req / ${config.rateLimit.windowMs / 1000}s`);
    console.log('-----------------------------------------------------------');
  });

  const shutdown = () => {
    console.log('\n[server] Shutting down WeatherGPT server...');
    server.close(() => {
      console.log('[server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch(err => {
  console.error('[server] Startup error:', err);
  process.exit(1);
});
