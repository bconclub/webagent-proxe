// Simple startup script that logs errors
import('./server.js').catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

