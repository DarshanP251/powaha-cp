const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../hash');

const prisma = new PrismaClient();

async function main() {
  const password = await hashPassword('admin123');

  await prisma.users.upsert({
    where: { email: 'admin@powaha.com' },
    update: {},
    create: {
      user_id: 'admin-001',
      email: 'admin@powaha.com',
      password,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
