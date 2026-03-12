require('dotenv').config();

const app = require('./app');
const prisma = require('./lib/prisma');

const PORT = parseInt(process.env.PORT, 10) || 3001;

const BASE_CATEGORIES = [
  { name: 'Alimentos y Bebidas' },
  { name: 'Ropa y Accesorios' },
  { name: 'Arte y Artesanías' },
  { name: 'Tecnología' },
  { name: 'Servicios Digitales' },
  { name: 'Tutorías y Clases' },
  { name: 'Otros' },
];

async function ensureCategories() {
  const count = await prisma.category.count();
  if (count === 0) {
    for (const cat of BASE_CATEGORIES) {
      await prisma.category.upsert({ where: { name: cat.name }, update: {}, create: cat });
    }
    console.log(`✅ Seeded ${BASE_CATEGORIES.length} base categories`);
  } else {
    console.log(`✅ Categories OK (${count} in DB)`);
  }
}

async function bootstrap() {
  // 1. Verify DB connection
  await prisma.$connect();
  console.log('✅ Database connected');

  // 2. Ensure base categories exist (CAUSE A fix — auto-seed if empty)
  await ensureCategories();

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
