import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users: Prisma.UserCreateInput[] = [
    {
      email: 'admin@example.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'SYSTEM_ADMIN',
    },
    {
      email: 'institution@example.com',
      name: 'Institution Admin',
      password: hashedPassword,
      role: 'INSTITUTION_ADMIN',
    },
    {
      email: 'manager@example.com',
      name: 'School Manager',
      password: hashedPassword,
      role: 'SCHOOL_MANAGER',
    },
    {
      email: 'teacher@example.com',
      name: 'Teacher',
      password: hashedPassword,
      role: 'TEACHER',
    },
    {
      email: 'student@example.com',
      name: 'Student',
      password: hashedPassword,
      role: 'STUDENT',
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
  }); 