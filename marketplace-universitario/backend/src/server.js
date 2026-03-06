require('dotenv').config();

const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const PORT = parseInt(process.env.PORT, 10) || 3001;
const prisma = new PrismaClient();

async function bootstrap() {
  // Verify DB connection before accepting traffic
  await prisma.$connect();
  console.log('📦 Database connected');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
}

// Only start server when NOT in test environment
if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
