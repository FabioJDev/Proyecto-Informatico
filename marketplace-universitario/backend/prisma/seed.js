// pruebas de seed para desarrollo local.
/*
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Categories ──────────────────────────────────────────────────────────
  const categories = [
    { name: 'Alimentos y Bebidas' },
    { name: 'Ropa y Accesorios' },
    { name: 'Arte y Artesanías' },
    { name: 'Servicios Digitales' },
    { name: 'Tutorías y Clases' },
    { name: 'Tecnología' },
    { name: 'Otros' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // ── Admin user ───────────────────────────────────────────────────────────
  const costFactor = parseInt(process.env.BCRYPT_COST_FACTOR) || 12;
  const adminPasswordHash = await bcrypt.hash('Admin123!', costFactor);

  await prisma.user.upsert({
    where: { email: 'admin@universidad.edu.co' },
    update: {},
    create: {
      email: 'admin@universidad.edu.co',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin user created: admin@universidad.edu.co');

  // ── Demo entrepreneur ────────────────────────────────────────────────────
  const entrepreneurHash = await bcrypt.hash('Demo123!', costFactor);
  const entrepreneur = await prisma.user.upsert({
    where: { email: 'emprendedor@universidad.edu.co' },
    update: {},
    create: {
      email: 'emprendedor@universidad.edu.co',
      passwordHash: entrepreneurHash,
      role: 'EMPRENDEDOR',
      status: 'ACTIVE',
    },
  });

  await prisma.profile.upsert({
    where: { userId: entrepreneur.id },
    update: {},
    create: {
      userId: entrepreneur.id,
      businessName: 'Delicias Uni',
      description: 'Emprendimiento de comida casera dentro del campus universitario.',
      contactInfo: 'WhatsApp: +57 300 000 0000',
    },
  });
  console.log('✅ Demo entrepreneur created: emprendedor@universidad.edu.co');

  // ── Demo buyer ───────────────────────────────────────────────────────────
  const buyerHash = await bcrypt.hash('Demo123!', costFactor);
  await prisma.user.upsert({
    where: { email: 'comprador@universidad.edu.co' },
    update: {},
    create: {
      email: 'comprador@universidad.edu.co',
      passwordHash: buyerHash,
      role: 'COMPRADOR',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Demo buyer created: comprador@universidad.edu.co');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\nDefault credentials:');
  console.log('  Admin      → admin@universidad.edu.co        / Admin123!');
  console.log('  Emprendedor → emprendedor@universidad.edu.co / Demo123!');
  console.log('  Comprador  → comprador@universidad.edu.co    / Demo123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
*/