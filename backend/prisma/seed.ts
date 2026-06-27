import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

const departments = [
  {
    department_id: 'CNTT_DEPT',
    name: 'Khoa Công nghệ thông tin',
    description: 'Đào tạo các ngành công nghệ thông tin và an toàn thông tin',
  },
  {
    department_id: 'CB_DEPT',
    name: 'Khoa Cơ bản',
    description: 'Đào tạo các môn đại cương và nền tảng',
  },
  {
    department_id: 'QTKD_DEPT',
    name: 'Khoa Quản trị kinh doanh',
    description: 'Đào tạo ngành quản trị kinh doanh',
  },
];

const majors = [
  {
    major_id: 'CNTT',
    name: 'Công nghệ thông tin',
    department_id: 'CNTT_DEPT',
    description: 'Chuyên ngành Công nghệ thông tin',
  },
  {
    major_id: 'ATTT',
    name: 'An toàn thông tin',
    department_id: 'CNTT_DEPT',
    description: 'Chuyên ngành An toàn thông tin',
  },
  {
    major_id: 'CB',
    name: 'Cơ bản',
    department_id: 'CB_DEPT',
    description: 'Chuyên ngành Cơ bản',
  },
  {
    major_id: 'QTKD',
    name: 'Quản trị kinh doanh',
    department_id: 'QTKD_DEPT',
    description: 'Chuyên ngành Quản trị kinh doanh',
  },
];

const semesters = [
  {
    name: 'Học kỳ 1',
    school_year: '2025-2026',
    start_date: date('2025-09-05'),
    end_date: date('2026-01-15'),
    is_active: false,
    is_register: false,
  },
  {
    name: 'Học kỳ 2',
    school_year: '2025-2026',
    start_date: date('2026-02-16'),
    end_date: date('2026-06-30'),
    is_active: true,
    is_register: true,
  },
  {
    name: 'Học kỳ 1',
    school_year: '2026-2027',
    start_date: date('2026-09-05'),
    end_date: date('2027-01-15'),
    is_active: false,
    is_register: false,
  },
];

const studentClasses = [
  {
    class_id: 'D23CQCN01-N',
    name: 'Lớp Công nghệ thông tin 01',
    cohort: 'D23',
    major_id: 'CNTT',
    capacity: 50,
  },
  {
    class_id: 'D23CQCN02-N',
    name: 'Lớp Công nghệ thông tin 02',
    cohort: 'D23',
    major_id: 'CNTT',
    capacity: 50,
  },
  {
    class_id: 'D23CQAT01-N',
    name: 'Lớp An toàn thông tin 01',
    cohort: 'D23',
    major_id: 'ATTT',
    capacity: 50,
  },
  {
    class_id: 'D23CQQT01-N',
    name: 'Lớp Quản trị kinh doanh 01',
    cohort: 'D23',
    major_id: 'QTKD',
    capacity: 50,
  },
];

const classrooms = [
  {
    classroom_id: 'A101',
    capacity: 5,
    type: 'Theory',
    description: 'Phòng lý thuyết A101',
    status: 'Ready',
  },
  {
    classroom_id: 'A102',
    capacity: 5,
    type: 'Theory',
    description: 'Phòng lý thuyết A102',
    status: 'Ready',
  },
  {
    classroom_id: 'A103',
    capacity: 5,
    type: 'Theory',
    description: 'Phòng lý thuyết A103',
    status: 'Ready',
  },
  {
    classroom_id: 'A104',
    capacity: 5,
    type: 'Theory',
    description: 'Phòng lý thuyết A104',
    status: 'Ready',
  },
  {
    classroom_id: 'A105',
    capacity: 5,
    type: 'Theory',
    description: 'Phòng lý thuyết A105',
    status: 'Ready',
  },
  {
    classroom_id: 'LAB01',
    capacity: 5,
    type: 'Practice',
    description: 'Phòng thực hành LAB01',
    status: 'Ready',
  },
  {
    classroom_id: 'LAB02',
    capacity: 5,
    type: 'Practice',
    description: 'Phòng thực hành LAB02',
    status: 'Ready',
  },
  {
    classroom_id: 'LAB03',
    capacity: 5,
    type: 'Practice',
    description: 'Phòng thực hành LAB03',
    status: 'Ready',
  },
  {
    classroom_id: 'LAB04',
    capacity: 5,
    type: 'Practice',
    description: 'Phòng thực hành LAB04',
    status: 'Ready',
  },
  {
    classroom_id: 'B201',
    capacity: 5,
    type: 'Theory',
    description: 'Phòng lý thuyết B201',
    status: 'Ready',
  },
];

const teacherProfiles = [
  {
    teacher_id: 'GV00',
    name: 'Nguyễn Văn An',
    degree: 'Thạc sĩ',
    expertise: 'Cấu trúc dữ liệu',
    department_id: 'CNTT_DEPT',
  },
  {
    teacher_id: 'GV01',
    name: 'Trần Thị Bình',
    degree: 'Thạc sĩ',
    expertise: 'Lập trình C++',
    department_id: 'CNTT_DEPT',
  },
  {
    teacher_id: 'GV02',
    name: 'Lê Minh Châu',
    degree: 'Tiến sĩ',
    expertise: 'Lập trình Java',
    department_id: 'CNTT_DEPT',
  },
  {
    teacher_id: 'GV03',
    name: 'Phạm Quốc Dũng',
    degree: 'Thạc sĩ',
    expertise: 'Phân tích thiết kế hệ thống',
    department_id: 'CNTT_DEPT',
  },
  {
    teacher_id: 'GV04',
    name: 'Hoàng Ngọc Hà',
    degree: 'Thạc sĩ',
    expertise: 'Ứng dụng di động',
    department_id: 'CNTT_DEPT',
  },
  {
    teacher_id: 'GV05',
    name: 'Đỗ Anh Khoa',
    degree: 'Tiến sĩ',
    expertise: 'An toàn mạng',
    department_id: 'CNTT_DEPT',
  },
  {
    teacher_id: 'GV06',
    name: 'Vũ Thị Lan',
    degree: 'Thạc sĩ',
    expertise: 'Quản trị doanh nghiệp',
    department_id: 'QTKD_DEPT',
  },
  {
    teacher_id: 'GV07',
    name: 'Bùi Thành Nam',
    degree: 'Thạc sĩ',
    expertise: 'Quản trị kinh doanh',
    department_id: 'QTKD_DEPT',
  },
  {
    teacher_id: 'GV08',
    name: 'Phan Thu Hương',
    degree: 'Thạc sĩ',
    expertise: 'Toán học',
    department_id: 'CB_DEPT',
  },
  {
    teacher_id: 'GV09',
    name: 'Đặng Minh Tuấn',
    degree: 'Thạc sĩ',
    expertise: 'Tin học cơ sở',
    department_id: 'CB_DEPT',
  },
];

const subjects = [
  {
    subject_id: 'CTDL',
    name: 'Cấu trúc dữ liệu',
    credits: 3,
    major_id: 'CNTT',
    allow_same_major: false,
    allow_same_department: true,
    required_room_type: 'Practice',
  },
  {
    subject_id: 'CPP',
    name: 'Lập trình C++',
    credits: 3,
    major_id: 'CNTT',
    allow_same_major: false,
    allow_same_department: true,
    required_room_type: 'Practice',
  },
  {
    subject_id: 'JAVA',
    name: 'Lập trình Java',
    credits: 3,
    major_id: 'CNTT',
    allow_same_major: false,
    allow_same_department: true,
    required_room_type: 'Practice',
  },
  {
    subject_id: 'PTTKHT',
    name: 'Phân tích thiết kế hệ thống',
    credits: 3,
    major_id: 'CNTT',
    allow_same_major: true,
    allow_same_department: false,
    required_room_type: 'Theory',
  },
  {
    subject_id: 'LTUDDD',
    name: 'Lập trình ứng dụng di động',
    credits: 3,
    major_id: 'CNTT',
    allow_same_major: true,
    allow_same_department: false,
    required_room_type: 'Practice',
  },
  {
    subject_id: 'ANMMT',
    name: 'An mạng máy tính',
    credits: 3,
    major_id: 'ATTT',
    allow_same_major: true,
    allow_same_department: false,
    required_room_type: 'Practice',
  },
  {
    subject_id: 'QTDN',
    name: 'Quản trị doanh nghiệp',
    credits: 3,
    major_id: 'QTKD',
    allow_same_major: false,
    allow_same_department: true,
    required_room_type: 'Theory',
  },
  {
    subject_id: 'GT',
    name: 'Giải tích',
    credits: 3,
    major_id: 'CB',
    allow_same_major: false,
    allow_same_department: false,
    required_room_type: 'Theory',
  },
  {
    subject_id: 'TCC',
    name: 'Toán cao cấp',
    credits: 3,
    major_id: 'CB',
    allow_same_major: false,
    allow_same_department: false,
    required_room_type: 'Theory',
  },
  {
    subject_id: 'THCS',
    name: 'Tin học cơ sở',
    credits: 3,
    major_id: 'CB',
    allow_same_major: false,
    allow_same_department: false,
    required_room_type: 'Practice',
  },
];

const teacherIdsByDepartment: Record<string, string[]> = {
  CNTT_DEPT: ['GV00', 'GV01', 'GV02', 'GV03', 'GV04', 'GV05'],
  QTKD_DEPT: ['GV06', 'GV07'],
  CB_DEPT: ['GV08', 'GV09'],
};

const scheduleSlots = [
  { dayOfWeek: '2', start_slot: 1, end_slot: 2 },
  { dayOfWeek: '2', start_slot: 3, end_slot: 4 },
  { dayOfWeek: '2', start_slot: 6, end_slot: 7 },
  { dayOfWeek: '2', start_slot: 8, end_slot: 9 },
  { dayOfWeek: '3', start_slot: 1, end_slot: 2 },
  { dayOfWeek: '3', start_slot: 3, end_slot: 4 },
  { dayOfWeek: '3', start_slot: 6, end_slot: 7 },
  { dayOfWeek: '3', start_slot: 8, end_slot: 9 },
  { dayOfWeek: '4', start_slot: 1, end_slot: 2 },
  { dayOfWeek: '4', start_slot: 3, end_slot: 4 },
  { dayOfWeek: '4', start_slot: 6, end_slot: 7 },
  { dayOfWeek: '4', start_slot: 8, end_slot: 9 },
  { dayOfWeek: '5', start_slot: 1, end_slot: 2 },
  { dayOfWeek: '5', start_slot: 3, end_slot: 4 },
  { dayOfWeek: '5', start_slot: 6, end_slot: 7 },
  { dayOfWeek: '5', start_slot: 8, end_slot: 9 },
  { dayOfWeek: '6', start_slot: 1, end_slot: 2 },
  { dayOfWeek: '6', start_slot: 3, end_slot: 4 },
  { dayOfWeek: '6', start_slot: 6, end_slot: 7 },
  { dayOfWeek: '6', start_slot: 8, end_slot: 9 },
];

async function upsertUser(email: string, role: string, password: string) {
  return prisma.user.upsert({
    where: { email },
    update: { password, role },
    create: { email, password, role },
  });
}

async function clearDatabase() {
  await prisma.teacherBusySchedule.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.studentClass.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.major.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const password = await bcrypt.hash('1', 10);

  await clearDatabase();

  await upsertUser('admin@gmail.com', 'sysadmin', password);
  await upsertUser('ministry0@gmail.com', 'ministry', password);
  await upsertUser('ministry1@gmail.com', 'ministry', password);

  for (const department of departments) {
    await prisma.department.upsert({
      where: { department_id: department.department_id },
      update: {
        name: department.name,
        description: department.description,
      },
      create: department,
    });
  }

  for (const major of majors) {
    await prisma.major.upsert({
      where: { major_id: major.major_id },
      update: {
        name: major.name,
        department_id: major.department_id,
        description: major.description,
      },
      create: major,
    });
  }

  for (const semester of semesters) {
    await prisma.semester.upsert({
      where: {
        name_school_year: {
          name: semester.name,
          school_year: semester.school_year,
        },
      },
      update: semester,
      create: semester,
    });
  }

  for (const studentClass of studentClasses) {
    await prisma.studentClass.upsert({
      where: { class_id: studentClass.class_id },
      update: {
        name: studentClass.name,
        cohort: studentClass.cohort,
        major_id: studentClass.major_id,
        capacity: studentClass.capacity,
      },
      create: studentClass,
    });
  }

  for (const classroom of classrooms) {
    await prisma.classroom.upsert({
      where: { classroom_id: classroom.classroom_id },
      update: classroom,
      create: classroom,
    });
  }

  for (const [index, teacher] of teacherProfiles.entries()) {
    const user = await upsertUser(
      `teacher${String(index).padStart(2, '0')}@gmail.com`,
      'teacher',
      password,
    );

    await prisma.teacher.upsert({
      where: { teacher_id: teacher.teacher_id },
      update: {
        user_id: user.id,
        name: teacher.name,
        degree: teacher.degree,
        expertise: teacher.expertise,
        department_id: teacher.department_id,
      },
      create: {
        teacher_id: teacher.teacher_id,
        user_id: user.id,
        name: teacher.name,
        degree: teacher.degree,
        expertise: teacher.expertise,
        department_id: teacher.department_id,
      },
    });
  }

  const classDistribution = [
    'D23CQCN01-N',
    'D23CQCN02-N',
    'D23CQAT01-N',
    'D23CQQT01-N',
  ];

  for (let index = 0; index < 20; index += 1) {
    const user = await upsertUser(
      `student${String(index).padStart(2, '0')}@gmail.com`,
      'student',
      password,
    );
    const classId = classDistribution[Math.floor(index / 5)];

    await prisma.student.upsert({
      where: { student_id: `SV${String(index).padStart(3, '0')}` },
      update: {
        user_id: user.id,
        name: `Sinh viên ${String(index + 1).padStart(2, '0')}`,
        class_id: classId,
      },
      create: {
        student_id: `SV${String(index).padStart(3, '0')}`,
        user_id: user.id,
        name: `Sinh viên ${String(index + 1).padStart(2, '0')}`,
        class_id: classId,
      },
    });
  }

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { subject_id: subject.subject_id },
      update: {
        name: subject.name,
        credits: subject.credits,
        major_id: subject.major_id,
        allow_same_major: subject.allow_same_major,
        allow_same_department: subject.allow_same_department,
      },
      create: {
        subject_id: subject.subject_id,
        name: subject.name,
        credits: subject.credits,
        major_id: subject.major_id,
        allow_same_major: subject.allow_same_major,
        allow_same_department: subject.allow_same_department,
      },
    });
  }

  const activeSemester = await prisma.semester.findUniqueOrThrow({
    where: {
      name_school_year: {
        name: 'Học kỳ 2',
        school_year: '2025-2026',
      },
    },
  });

  const futureSemester = await prisma.semester.findFirstOrThrow({
    where: {
      school_year: '2026-2027',
    },
  });

  const courseSeeds = subjects.flatMap((subject, subjectIndex) => {
    const major = majors.find((item) => item.major_id === subject.major_id);
    if (!major) {
      throw new Error(
        `Major ${subject.major_id} not found for subject ${subject.subject_id}`,
      );
    }

    const compatibleTeachers = teacherIdsByDepartment[major.department_id];

    return [0, 1].map((groupIndex) => {
      const courseIndex = subjectIndex * 2 + groupIndex;
      const theoryRooms = classrooms.filter((room) => room.type === 'Theory');
      const practiceRooms = classrooms.filter(
        (room) => room.type === 'Practice',
      );
      const rooms =
        subject.required_room_type === 'Practice' ? practiceRooms : theoryRooms;

      return {
        course_code: `${subject.subject_id}-${groupIndex + 1}`,
        subject_id: subject.subject_id,
        teacher_id:
          compatibleTeachers[
            (subjectIndex + groupIndex) % compatibleTeachers.length
          ],
        semester_id: activeSemester.semester_id,
        capacity: 5,
        remaining_capacity: 5,
        required_room_type: subject.required_room_type,
        classroom_id: rooms[courseIndex % rooms.length].classroom_id,
        schedule: scheduleSlots[courseIndex],
        start_date: activeSemester.start_date,
        end_date: activeSemester.end_date,
      };
    });
  });

  const futureTestCourse = {
    course_code: 'CTDL-2026HK1-TEST',
    subject_id: 'CTDL',
    teacher_id: 'GV00',
    semester_id: futureSemester.semester_id,
    capacity: 5,
    remaining_capacity: 5,
    required_room_type: 'Theory',
    classroom_id: 'A101',
    schedule: { dayOfWeek: '2', start_slot: 1, end_slot: 2 },
    start_date: futureSemester.start_date,
    end_date: futureSemester.end_date,
  };

  const allCourseSeeds = [...courseSeeds, futureTestCourse];

  await prisma.schedule.deleteMany({
    where: {
      course: {
        course_code: {
          in: allCourseSeeds.map((course) => course.course_code),
        },
      },
    },
  });

  const courseIdByCode = new Map<string, string>();
  for (const course of allCourseSeeds) {
    const savedCourse = await prisma.course.upsert({
      where: { course_code: course.course_code },
      update: {
        subject_id: course.subject_id,
        teacher_id: course.teacher_id,
        semester_id: course.semester_id,
        capacity: course.capacity,
        remaining_capacity: course.remaining_capacity,
        required_room_type: course.required_room_type,
      },
      create: {
        course_code: course.course_code,
        subject_id: course.subject_id,
        teacher_id: course.teacher_id,
        semester_id: course.semester_id,
        capacity: course.capacity,
        remaining_capacity: course.remaining_capacity,
        required_room_type: course.required_room_type,
      },
    });
    courseIdByCode.set(course.course_code, savedCourse.course_id);
  }

  for (const course of allCourseSeeds) {
    const courseId = courseIdByCode.get(course.course_code);
    if (!courseId) {
      throw new Error(`Course ${course.course_code} was not created`);
    }

    await prisma.schedule.create({
      data: {
        course_id: courseId,
        classroom_id: course.classroom_id,
        dayOfWeek: course.schedule.dayOfWeek,
        start_slot: course.schedule.start_slot,
        end_slot: course.schedule.end_slot,
        start_date: course.start_date,
        end_date: course.end_date,
      },
    });
  }

  // --- Add Enrollments for student00 (SV000) ---
  const coursesToEnroll = allCourseSeeds.slice(0, 3);
  for (const course of coursesToEnroll) {
    const courseId = courseIdByCode.get(course.course_code);
    if (courseId) {
      await prisma.enrollment.create({
        data: {
          student_id: 'SV000',
          course_id: courseId,
        },
      });
      // Giảm remaining_capacity
      await prisma.course.update({
        where: { course_id: courseId },
        data: {
          remaining_capacity: { decrement: 1 },
        },
      });
    }
  }

  // --- Add Busy Schedules for giaovien00 (GV00) and giaovien01 (GV01) ---
  const gv00_busy_date = new Date(activeSemester.start_date);
  gv00_busy_date.setDate(gv00_busy_date.getDate() + 5);

  await prisma.teacherBusySchedule.create({
    data: {
      teacher_id: 'GV00',
      busy_date: gv00_busy_date,
      start_slot: 1,
      end_slot: 4,
      reason: 'Họp hội đồng khoa',
      status: 'approved',
    },
  });

  const gv01_busy_date = new Date(activeSemester.start_date);
  gv01_busy_date.setDate(gv01_busy_date.getDate() + 10);

  await prisma.teacherBusySchedule.create({
    data: {
      teacher_id: 'GV01',
      busy_date: gv01_busy_date,
      start_slot: 6,
      end_slot: 9,
      reason: 'Công tác nước ngoài',
      status: 'pending',
    },
  });

  console.log('Seed completed');
  console.log('Password for all seeded accounts: 1');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
