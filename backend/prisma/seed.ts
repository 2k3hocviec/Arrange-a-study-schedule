import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;

const ministryUsers = [
    { email: 'ministry0@ptit.dkt' },
    { email: 'ministry1@ptit.dkt' },
  ];

const teacherUsers = [
    { email: 'teacher0@ptit.dkt' },
    { email: 'teacher1@ptit.dkt' },
    { email: 'teacher2@ptit.dkt' },
    { email: 'teacher3@ptit.dkt' },
    { email: 'teacher4@ptit.dkt' },
    { email: 'teacher5@ptit.dkt' },
    { email: 'teacher6@ptit.dkt' },
    { email: 'teacher7@ptit.dkt' },
    { email: 'teacher8@ptit.dkt' },
    { email: 'teacher9@ptit.dkt' },
  ];

const studentUsers = [
    { email: 'student0@ptit.dkt' },
    { email: 'student1@ptit.dkt' },
    { email: 'student2@ptit.dkt' },
    { email: 'student3@ptit.dkt' },
    { email: 'student4@ptit.dkt' },
    { email: 'student5@ptit.dkt' },
    { email: 'student6@ptit.dkt' },
    { email: 'student7@ptit.dkt' },
    { email: 'student8@ptit.dkt' },
    { email: 'student9@ptit.dkt' },
  ];

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

async function main() {
  const password = await bcrypt.hash('1', 10);

  await prisma.user.upsert({
    where: { email: 'admin@ptit.dkt' },
    update: {
      password,
      role: 'sysadmin',
    },
    create: {
      email: 'admin@ptit.dkt',
      password,
      role: 'sysadmin',
    },
  });

  for (const user of ministryUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password,
        role: 'ministry',
      },
      create: {
        email: user.email,
        password,
        role: 'ministry',
      },
    });
  }

  for (const user of teacherUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password,
        role: 'teacher',
      },
      create: {
        email: user.email,
        password,
        role: 'teacher',
      },
    });
  }

  for (const user of studentUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password,
        role: 'student',
      },
      create: {
        email: user.email,
        password,
        role: 'student',
      },
    });
  }

  console.log('Seeded success');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
