const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@powaha.com';
    const plainPassword = 'admin123';

    // check if admin already exists
    const existing = await prisma.users.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('⚠️ Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await prisma.users.create({
      data: {
        user_id: uuid(),
        email,
        password: hashedPassword,
        role: 'ADMIN',
        cp_id: null
      }
    });

    console.log('✅ Admin user created successfully');
    console.log('Email:', email);
    console.log('Password:', plainPassword);

  } catch (err) {
    console.error('❌ Failed to create admin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
