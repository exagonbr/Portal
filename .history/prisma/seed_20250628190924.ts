import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@example.com',
      name: 'System Admin',
      password: hashedPassword,
      role: UserRole.SYSTEM_ADMIN,
    },
    {
      email: 'institution@example.com',
      name: 'Institution Admin',
      password: hashedPassword,
      role: UserRole.INSTITUTION_ADMIN,
    },
    {
      email: 'manager@example.com',
      name: 'School Manager',
      password: hashedPassword,
      role: UserRole.SCHOOL_MANAGER,
    },
    {
      email: 'teacher@example.com',
      name: 'Teacher',
      password: hashedPassword,
      role: UserRole.TEACHER,
    },
    {
      email: 'student@example.com',
      name: 'Student',
      password: hashedPassword,
      role: UserRole.STUDENT,
    },
  ];

  for (const userData of users) {
    await prisma.user.create({
      data: userData,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 