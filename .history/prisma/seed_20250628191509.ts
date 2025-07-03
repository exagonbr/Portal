import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = [
    {
      email: 'admin@sabercon.edu.br',
      name: 'System Admin',
      password: hashedPassword,
      role: 'SYSTEM_ADMIN',
    },
    {
      email: 'institution@sabercon.edu.br',
      name: 'Institution Admin',
      password: hashedPassword,
      role: 'INSTITUTION_ADMIN',
    },
    {
      email: 'manager@sabercon.edu.br',
      name: 'School Manager',
      password: hashedPassword,
      role: 'SCHOOL_MANAGER',
    },
    {
      email: 'teacher@sabercon.edu.br',
      name: 'Teacher',
      password: hashedPassword,
      role: 'TEACHER',
    },
    {
      email: 'student@sabercon.edu.br',
      name: 'Student',
      password: hashedPassword,
      role: 'STUDENT',
    },
    {
      email: 'guardian@sabercon.edu.br',
      name: 'Guardian',
      password: hashedPassword,
      role: 'GUARDIAN',
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 