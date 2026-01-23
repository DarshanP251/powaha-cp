const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const prisma = new PrismaClient();

async function setup() {
  try {
    // Create or update test CP user
    const cpEmail = 'cp@test.com';
    const cpPassword = 'cp123456';

    const existingCp = await prisma.users.findUnique({
      where: { email: cpEmail }
    });

    if (existingCp) {
      // Update password
      const hashedPassword = await bcrypt.hash(cpPassword, 10);
      await prisma.users.update({
        where: { email: cpEmail },
        data: { password: hashedPassword }
      });
      console.log('✅ Test CP password reset: cp@test.com / cp123456');
    } else {
      const cpId = uuid();
      const hashedPassword = await bcrypt.hash(cpPassword, 10);

      await prisma.users.create({
        data: {
          user_id: uuid(),
          email: cpEmail,
          password: hashedPassword,
          role: 'CP',
          cp_id: cpId
        }
      });

      // Create CP profile
      await prisma.community_partners.create({
        data: {
          cp_id: cpId,
          name: 'Test CP',
          email: cpEmail,
          mobile: '9999999999',
          status: 'ACTIVE',
          aoo: ['District A', 'District B']
        }
      });

      console.log('✅ Test CP created: cp@test.com / cp123456');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
