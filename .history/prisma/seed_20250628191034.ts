import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'admin@sabercon.edu.br',
      name: 'System Admin',
      password: hashedPassword,
      role: UserRole.SYSTEM_ADMIN,
    },
    {
      email: 'institution@sabercon.edu.br',
      name: 'Institution Admin',
      password: hashedPassword,
      role: UserRole.INSTITUTION_ADMIN,
    },
    {
      email: 'manager@sabercon.edu.br',
      name: 'School Manager',
      password: hashedPassword,
      role: UserRole.SCHOOL_MANAGER,
    },
    {
      email: 'teacher@sabercon.edu.br',
      name: 'Teacher',
      password: hashedPassword,
      role: UserRole.TEACHER,
    },
    {
      email: 'student@sabercon.edu.br',
      name: 'Student',
      password: hashedPassword,
      role: UserRole.STUDENT,
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