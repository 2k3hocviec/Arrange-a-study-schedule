import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, User } from '@prisma/client';
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

const teacherProfiles = [
  {
    teacher_id: 'GV001',
    name: 'Nguyễn Thị Bích Nguyên',
    degree: 'ThS',
    expertise: 'Công nghệ thông tin 2',
  },
  {
    teacher_id: 'GV002',
    name: 'Nguyễn Thị Tuyết Hải',
    degree: 'TS',
    expertise: 'Công nghệ thông tin 2',
  },
  {
    teacher_id: 'GV003',
    name: 'Huỳnh Trọng Thưa',
    degree: 'ThS',
    expertise: 'Mạng máy tính 2',
  },
  {
    teacher_id: 'GV004',
    name: 'Phạm Minh Tuấn',
    degree: 'TS',
    expertise: 'Trí tuệ nhân tạo 2',
  },
  {
    teacher_id: 'GV005',
    name: 'Lê Hà Thanh',
    degree: 'ThS',
    expertise: 'Hệ Thống thông tin 2',
  },
  {
    teacher_id: 'GV006',
    name: 'Lê Ngọc Hiếu',
    degree: 'TS',
    expertise: 'An toàn thông tin 2',
  },
  {
    teacher_id: 'GV007',
    name: 'Lê Ngọc Hiếu',
    degree: 'ThS',
    expertise: 'Công nghệ thông tin 1',
  },
  {
    teacher_id: 'GV008',
    name: 'Nguyễn Hoàng Thành',
    degree: 'TS',
    expertise: 'Công nghệ thông tin 1',
  },
  {
    teacher_id: 'GV009',
    name: 'Nguyễn Thị Tri Lý',
    degree: 'ThS',
    expertise: 'Cơ bản 2',
  },
  {
    teacher_id: 'GV010',
    name: 'Mai Thành Tâm',
    degree: 'TS',
    expertise: 'Đa phương tiện 2',
  },
];

const studentProfiles = [
  { student_id: 'N23DCCN166', name: 'Huỳnh Hoàng Khoa' },
  { student_id: 'N23DCCN122', name: 'Lê Hồng Thái' },
  { student_id: 'N23DCAT111', name: 'Nguyễn Hữu Duy' },
  { student_id: 'N23DCCN162', name: 'Phạm Đình Hải' },
  { student_id: 'N23DCCN164', name: 'Nguyễn Ngọc Quốc Huy' },
  { student_id: 'N23DCCN165', name: 'Nguyễn Đông Din' },
  { student_id: 'N23DCCN167', name: 'Lê Vũ Hảo' },
  { student_id: 'N23DCCN168', name: 'Trần Hoàng Đạt' },
  { student_id: 'N23DCCN169', name: 'Nguyễn Xuân Hữu' },
  { student_id: 'N23DCCN110', name: 'Mai Xuân Hiếu' },
];

const classroomSeeds = [
  {
    classroom_id: '2A01',
    capacity: 5,
    type: 'Theory',
    description: 'Máy chiếu, bảng trắng, micro không dây',
    status: 'Ready',
  },
  {
    classroom_id: '2A02',
    capacity: 6,
    type: 'Theory',
    description: 'Máy chiếu, loa treo tường, điều hòa',
    status: 'Ready',
  },
  {
    classroom_id: '2A03',
    capacity: 7,
    type: 'Practice',
    description: 'Máy tính thực hành, máy chiếu, mạng LAN',
    status: 'Ready',
  },
  {
    classroom_id: '2A04',
    capacity: 8,
    type: 'Theory',
    description: 'Bảng tương tác, micro, camera lớp học',
    status: 'Maintaince',
  },
  {
    classroom_id: '2A05',
    capacity: 9,
    type: 'Practice',
    description: 'Máy tính cấu hình cao, máy chiếu, điều hòa',
    status: 'Ready',
  },
  {
    classroom_id: '2A06',
    capacity: 10,
    type: 'Theory',
    description: 'Máy chiếu, bảng kính, loa âm trần',
    status: 'Ready',
  },
  {
    classroom_id: '2A07',
    capacity: 5,
    type: 'Practice',
    description: 'Phòng lab mạng, switch, router thực hành',
    status: 'Maintaince',
  },
  {
    classroom_id: '2A08',
    capacity: 6,
    type: 'Theory',
    description: 'Máy chiếu, bảng trắng, hệ thống âm thanh',
    status: 'Ready',
  },
  {
    classroom_id: '2A09',
    capacity: 8,
    type: 'Practice',
    description: 'Máy tính thực hành, tai nghe, máy chiếu',
    status: 'Ready',
  },
  {
    classroom_id: '2A10',
    capacity: 10,
    type: 'Theory',
    description: 'Máy chiếu, màn chiếu lớn, micro cài áo',
    status: 'Maintaince',
  },
];

const subjectSeeds = [
  { subject_id: 'INT1337', name: 'Lập trình hướng đối tượng', credits: 3 },
  { subject_id: 'INT1306', name: 'Cơ sở dữ liệu', credits: 3 },
  { subject_id: 'INT1312', name: 'Cấu trúc dữ liệu và giải thuật', credits: 3 },
  { subject_id: 'INT1405', name: 'Mạng máy tính', credits: 3 },
  { subject_id: 'INT1414', name: 'Công nghệ phần mềm', credits: 3 },
  { subject_id: 'INT1434', name: 'Trí tuệ nhân tạo', credits: 3 },
  { subject_id: 'INT1448', name: 'An toàn thông tin', credits: 3 },
  { subject_id: 'INT1450', name: 'Phát triển ứng dụng web', credits: 4 },
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

  const seededTeacherUsers: User[] = [];
  for (const user of teacherUsers) {
    const seededUser = await prisma.user.upsert({
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
    seededTeacherUsers.push(seededUser);
  }

  const seededStudentUsers: User[] = [];
  for (const user of studentUsers) {
    const seededUser = await prisma.user.upsert({
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
    seededStudentUsers.push(seededUser);
  }

  for (const [index, user] of seededTeacherUsers.entries()) {
    const profile = teacherProfiles[index];
    const existingTeacher = await prisma.teacher.findUnique({
      where: { user_id: user.id },
    });

    if (existingTeacher) {
      await prisma.teacher.update({
        where: { teacher_id: existingTeacher.teacher_id },
        data: {
          name: profile.name,
          degree: profile.degree,
          expertise: profile.expertise,
        },
      });
      continue;
    }

    await prisma.teacher.upsert({
      where: { teacher_id: profile.teacher_id },
      update: {
        user_id: user.id,
        name: profile.name,
        degree: profile.degree,
        expertise: profile.expertise,
      },
      create: {
        teacher_id: profile.teacher_id,
        user_id: user.id,
        name: profile.name,
        degree: profile.degree,
        expertise: profile.expertise,
      },
    });
  }

  for (const [index, user] of seededStudentUsers.entries()) {
    const profile = studentProfiles[index];
    const existingStudent = await prisma.student.findUnique({
      where: { user_id: user.id },
    });

    if (existingStudent) {
      await prisma.student.update({
        where: { student_id: existingStudent.student_id },
        data: { name: profile.name },
      });
      continue;
    }

    await prisma.student.upsert({
      where: { student_id: profile.student_id },
      update: {
        user_id: user.id,
        name: profile.name,
      },
      create: {
        student_id: profile.student_id,
        user_id: user.id,
        name: profile.name,
      },
    });
  }

  for (const classroom of classroomSeeds) {
    await prisma.classroom.upsert({
      where: { classroom_id: classroom.classroom_id },
      update: {
        capacity: classroom.capacity,
        type: classroom.type,
        description: classroom.description,
        status: classroom.status,
      },
      create: classroom,
    });
  }

  for (const subject of subjectSeeds) {
    await prisma.subject.upsert({
      where: { subject_id: subject.subject_id },
      update: {
        name: subject.name,
        credits: subject.credits,
      },
      create: subject,
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
