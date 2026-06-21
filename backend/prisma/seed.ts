import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type User } from '@prisma/client';
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
    name: 'Mai Thanh Tâm',
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
    capacity: 10,
    type: 'Theory',
    description: 'Máy chiếu, bảng trắng, micro không dây',
    status: 'Ready',
  },
  {
    classroom_id: '2A02',
    capacity: 10,
    type: 'Theory',
    description: 'Máy chiếu, loa treo tường, điều hòa',
    status: 'Ready',
  },
  {
    classroom_id: '2A03',
    capacity: 10,
    type: 'Practice',
    description: 'Máy tính thực hành, máy chiếu, mạng LAN',
    status: 'Ready',
  },
  {
    classroom_id: '2A04',
    capacity: 10,
    type: 'Theory',
    description: 'Bảng tương tác, micro, camera lớp học',
    status: 'Maintaince',
  },
  {
    classroom_id: '2A05',
    capacity: 10,
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
    capacity: 10,
    type: 'Practice',
    description: 'Phòng lab mạng, switch, router thực hành',
    status: 'Maintaince',
  },
  {
    classroom_id: '2A08',
    capacity: 10,
    type: 'Theory',
    description: 'Máy chiếu, bảng trắng, hệ thống âm thanh',
    status: 'Ready',
  },
  {
    classroom_id: '2A09',
    capacity: 10,
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

const semesterSeeds = [
  {
    name: 'HK1',
    school_year: '2025-2026',
    start_date: new Date('2025-08-01'),
    end_date: new Date('2025-12-25'),
    is_active: false,
  },
  {
    name: 'HK2',
    school_year: '2025-2026',
    start_date: new Date('2026-01-05'),
    end_date: new Date('2026-05-31'),
    is_active: true,
  },
  {
    name: 'HK1',
    school_year: '2026-2027',
    start_date: new Date('2026-08-01'),
    end_date: new Date('2026-12-25'),
    is_active: false,
  },
];

const courseSeeds = [
  {
    course_code: 'INT1337-01',
    subject_id: 'INT1337',
    teacher_id: 'GV001',
    capacity: 5,
    remaining_capacity: 5,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1337-02',
    subject_id: 'INT1337',
    teacher_id: 'GV002',
    capacity: 6,
    remaining_capacity: 6,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1337-03',
    subject_id: 'INT1337',
    teacher_id: 'GV007',
    capacity: 7,
    remaining_capacity: 7,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1306-01',
    subject_id: 'INT1306',
    teacher_id: 'GV005',
    capacity: 8,
    remaining_capacity: 8,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1306-02',
    subject_id: 'INT1306',
    teacher_id: 'GV008',
    capacity: 6,
    remaining_capacity: 6,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1312-01',
    subject_id: 'INT1312',
    teacher_id: 'GV003',
    capacity: 7,
    remaining_capacity: 7,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1312-02',
    subject_id: 'INT1312',
    teacher_id: 'GV001',
    capacity: 5,
    remaining_capacity: 5,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1405-01',
    subject_id: 'INT1405',
    teacher_id: 'GV003',
    capacity: 8,
    remaining_capacity: 8,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1405-02',
    subject_id: 'INT1405',
    teacher_id: 'GV006',
    capacity: 5,
    remaining_capacity: 5,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1414-01',
    subject_id: 'INT1414',
    teacher_id: 'GV005',
    capacity: 9,
    remaining_capacity: 9,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1434-01',
    subject_id: 'INT1434',
    teacher_id: 'GV004',
    capacity: 6,
    remaining_capacity: 6,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1434-02',
    subject_id: 'INT1434',
    teacher_id: 'GV010',
    capacity: 8,
    remaining_capacity: 8,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1448-01',
    subject_id: 'INT1448',
    teacher_id: 'GV006',
    capacity: 6,
    remaining_capacity: 6,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1448-02',
    subject_id: 'INT1448',
    teacher_id: 'GV009',
    capacity: 5,
    remaining_capacity: 5,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1450-01',
    subject_id: 'INT1450',
    teacher_id: 'GV008',
    capacity: 9,
    remaining_capacity: 9,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1450-02',
    subject_id: 'INT1450',
    teacher_id: 'GV010',
    capacity: 10,
    remaining_capacity: 10,
    required_room_type: 'Theory',
  },
];

const scheduleSeeds = [
  {
    course_code: 'INT1337-01',
    classroom_id: '2A01',
    dayOfWeek: '2',
    start_slot: 1,
    end_slot: 5,
    start_date: new Date('2026-01-05'),
    end_date: new Date('2026-05-31'),
  },
  {
    course_code: 'INT1306-01',
    classroom_id: '2A06',
    dayOfWeek: '3',
    start_slot: 1,
    end_slot: 5,
    start_date: new Date('2026-01-05'),
    end_date: new Date('2026-05-31'),
  },
  {
    course_code: 'INT1337-03',
    classroom_id: '2A03',
    dayOfWeek: '4',
    start_slot: 1,
    end_slot: 5,
    start_date: new Date('2026-01-05'),
    end_date: new Date('2026-05-31'),
  },
  {
    course_code: 'INT1306-02',
    classroom_id: '2A05',
    dayOfWeek: '5',
    start_slot: 1,
    end_slot: 5,
    start_date: new Date('2026-01-05'),
    end_date: new Date('2026-05-31'),
  },
  {
    course_code: 'INT1434-01',
    classroom_id: '2A02',
    dayOfWeek: '6',
    start_slot: 1,
    end_slot: 5,
    start_date: new Date('2026-01-05'),
    end_date: new Date('2026-05-31'),
  },
  {
    course_code: 'INT1450-01',
    classroom_id: '2A05',
    dayOfWeek: '7',
    start_slot: 1,
    end_slot: 5,
    start_date: new Date('2026-01-05'),
    end_date: new Date('2026-05-31'),
  },
  {
    course_code: 'INT1448-01',
    classroom_id: '2A08',
    dayOfWeek: '2',
    start_slot: 6,
    end_slot: 10,
    start_date: new Date('2026-01-05'),
    end_date: new Date('2026-05-31'),
  },
];

const enrollmentSeeds = [
  { student_id: 'N23DCCN166', course_code: 'INT1337-01' },
  { student_id: 'N23DCCN166', course_code: 'INT1306-02' },
  { student_id: 'N23DCCN166', course_code: 'INT1434-01' },
  { student_id: 'N23DCCN122', course_code: 'INT1337-01' },
  { student_id: 'N23DCCN122', course_code: 'INT1306-01' },
  { student_id: 'N23DCCN122', course_code: 'INT1450-01' },
  { student_id: 'N23DCAT111', course_code: 'INT1337-03' },
  { student_id: 'N23DCAT111', course_code: 'INT1448-01' },
  { student_id: 'N23DCCN162', course_code: 'INT1306-01' },
  { student_id: 'N23DCCN162', course_code: 'INT1434-01' },
  { student_id: 'N23DCCN164', course_code: 'INT1337-03' },
  { student_id: 'N23DCCN164', course_code: 'INT1450-01' },
  { student_id: 'N23DCCN165', course_code: 'INT1337-01' },
  { student_id: 'N23DCCN165', course_code: 'INT1448-01' },
  { student_id: 'N23DCCN167', course_code: 'INT1306-02' },
  { student_id: 'N23DCCN168', course_code: 'INT1434-01' },
];

const activeCourseSeeds = [
  {
    course_code: 'INT1337-01',
    subject_id: 'INT1337',
    teacher_id: 'GV001',
    semester: { name: 'HK1', school_year: '2025-2026' },
    capacity: 5,
    remaining_capacity: 5,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1306-01',
    subject_id: 'INT1306',
    teacher_id: 'GV005',
    semester: { name: 'HK1', school_year: '2025-2026' },
    capacity: 8,
    remaining_capacity: 8,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1337-03',
    subject_id: 'INT1337',
    teacher_id: 'GV007',
    semester: { name: 'HK1', school_year: '2025-2026' },
    capacity: 7,
    remaining_capacity: 7,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1306-02',
    subject_id: 'INT1306',
    teacher_id: 'GV008',
    semester: { name: 'HK2', school_year: '2025-2026' },
    capacity: 6,
    remaining_capacity: 6,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1434-01',
    subject_id: 'INT1434',
    teacher_id: 'GV004',
    semester: { name: 'HK2', school_year: '2025-2026' },
    capacity: 6,
    remaining_capacity: 6,
    required_room_type: 'Theory',
  },
  {
    course_code: 'INT1450-01',
    subject_id: 'INT1450',
    teacher_id: 'GV008',
    semester: { name: 'HK2', school_year: '2025-2026' },
    capacity: 9,
    remaining_capacity: 9,
    required_room_type: 'Practice',
  },
  {
    course_code: 'INT1448-01',
    subject_id: 'INT1448',
    teacher_id: 'GV006',
    semester: { name: 'HK2', school_year: '2025-2026' },
    capacity: 6,
    remaining_capacity: 6,
    required_room_type: 'Theory',
  },
];

const activeScheduleSeeds = [
  {
    course_code: 'INT1337-01',
    classroom_id: '2A01',
    dayOfWeek: '2',
    start_slot: 1,
    end_slot: 5,
  },
  {
    course_code: 'INT1306-01',
    classroom_id: '2A06',
    dayOfWeek: '3',
    start_slot: 1,
    end_slot: 5,
  },
  {
    course_code: 'INT1337-03',
    classroom_id: '2A03',
    dayOfWeek: '4',
    start_slot: 6,
    end_slot: 10,
  },
  {
    course_code: 'INT1306-02',
    classroom_id: '2A05',
    dayOfWeek: '2',
    start_slot: 1,
    end_slot: 5,
  },
  {
    course_code: 'INT1434-01',
    classroom_id: '2A02',
    dayOfWeek: '3',
    start_slot: 6,
    end_slot: 10,
  },
  {
    course_code: 'INT1450-01',
    classroom_id: '2A05',
    dayOfWeek: '4',
    start_slot: 6,
    end_slot: 10,
  },
  {
    course_code: 'INT1448-01',
    classroom_id: '2A08',
    dayOfWeek: '5',
    start_slot: 1,
    end_slot: 5,
  },
];

const activeEnrollmentSeeds = [
  { student_id: 'N23DCCN166', course_code: 'INT1337-01' },
  { student_id: 'N23DCCN166', course_code: 'INT1306-02' },
  { student_id: 'N23DCCN166', course_code: 'INT1434-01' },
  { student_id: 'N23DCCN122', course_code: 'INT1337-01' },
  { student_id: 'N23DCCN122', course_code: 'INT1306-01' },
  { student_id: 'N23DCCN122', course_code: 'INT1450-01' },
  { student_id: 'N23DCAT111', course_code: 'INT1337-03' },
  { student_id: 'N23DCAT111', course_code: 'INT1448-01' },
  { student_id: 'N23DCCN162', course_code: 'INT1306-01' },
  { student_id: 'N23DCCN162', course_code: 'INT1434-01' },
  { student_id: 'N23DCCN164', course_code: 'INT1337-03' },
  { student_id: 'N23DCCN164', course_code: 'INT1450-01' },
  { student_id: 'N23DCCN165', course_code: 'INT1337-01' },
  { student_id: 'N23DCCN165', course_code: 'INT1448-01' },
  { student_id: 'N23DCCN167', course_code: 'INT1306-02' },
  { student_id: 'N23DCCN168', course_code: 'INT1434-01' },
];

const managedCourseCodes = courseSeeds.map((course) => course.course_code);
const activeCourseCodes = activeCourseSeeds.map((course) => course.course_code);
const allowedScheduleSlots = [
  { start_slot: 1, end_slot: 5 },
  { start_slot: 6, end_slot: 10 },
];

const semesterKey = (semester: { name: string; school_year: string }) =>
  `${semester.name}:${semester.school_year}`;

const isSameSlot = (
  left: { start_slot: number; end_slot: number },
  right: { start_slot: number; end_slot: number },
) => left.start_slot === right.start_slot && left.end_slot === right.end_slot;

const schedulesOverlap = (
  left: { start_slot: number; end_slot: number },
  right: { start_slot: number; end_slot: number },
) => left.start_slot <= right.end_slot && right.start_slot <= left.end_slot;

const assertUnique = (values: string[], label: string) => {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
};

function validateSeedData() {
  assertUnique(activeCourseCodes, 'course seed');
  assertUnique(
    activeScheduleSeeds.map((schedule) => schedule.course_code),
    'schedule course',
  );
  assertUnique(
    activeEnrollmentSeeds.map(
      (enrollment) => `${enrollment.student_id}:${enrollment.course_code}`,
    ),
    'enrollment seed',
  );

  const courseByCode = new Map(
    activeCourseSeeds.map((course) => [course.course_code, course]),
  );
  const classroomById = new Map(
    classroomSeeds.map((classroom) => [classroom.classroom_id, classroom]),
  );
  const semesterByKey = new Map(
    semesterSeeds.map((semester) => [semesterKey(semester), semester]),
  );
  const scheduleByCourseCode = new Map(
    activeScheduleSeeds.map((schedule) => [schedule.course_code, schedule]),
  );

  if (activeScheduleSeeds.length !== activeCourseSeeds.length) {
    throw new Error('Every seeded course must have exactly one schedule');
  }

  for (const course of activeCourseSeeds) {
    if (!semesterByKey.has(semesterKey(course.semester))) {
      throw new Error(`Semester not found for course ${course.course_code}`);
    }
    if (!scheduleByCourseCode.has(course.course_code)) {
      throw new Error(`Missing schedule for course ${course.course_code}`);
    }
  }

  const roomSlotKeys = new Set<string>();
  const teacherSlotKeys = new Set<string>();

  for (const schedule of activeScheduleSeeds) {
    const course = courseByCode.get(schedule.course_code);
    if (!course) {
      throw new Error(
        `Course ${schedule.course_code} is required for schedule seed`,
      );
    }

    if (
      schedule.dayOfWeek !== schedule.dayOfWeek.trim() ||
      !['2', '3', '4', '5', '6', '7', '8'].includes(schedule.dayOfWeek)
    ) {
      throw new Error(
        `Schedule ${schedule.course_code} dayOfWeek must be a clean string from "2" to "8"`,
      );
    }

    if (!allowedScheduleSlots.some((slot) => isSameSlot(slot, schedule))) {
      throw new Error(
        `Schedule ${schedule.course_code} must use slot 1-5 or 6-10`,
      );
    }

    const classroom = classroomById.get(schedule.classroom_id);
    if (!classroom) {
      throw new Error(
        `Classroom ${schedule.classroom_id} is required for schedule seed`,
      );
    }
    if (classroom.status !== 'Ready') {
      throw new Error(`Classroom ${schedule.classroom_id} is not ready`);
    }
    if (classroom.type !== course.required_room_type) {
      throw new Error(
        `Classroom ${schedule.classroom_id} type does not match ${schedule.course_code}`,
      );
    }
    if (course.capacity && classroom.capacity < course.capacity) {
      throw new Error(
        `Classroom ${schedule.classroom_id} capacity is less than ${schedule.course_code}`,
      );
    }

    const keyPrefix = [
      semesterKey(course.semester),
      schedule.dayOfWeek,
      schedule.start_slot,
      schedule.end_slot,
    ].join(':');
    const roomSlotKey = `${keyPrefix}:room:${schedule.classroom_id}`;
    const teacherSlotKey = `${keyPrefix}:teacher:${course.teacher_id}`;

    if (roomSlotKeys.has(roomSlotKey)) {
      throw new Error(`Room conflict in schedule seed: ${roomSlotKey}`);
    }
    roomSlotKeys.add(roomSlotKey);

    if (teacherSlotKeys.has(teacherSlotKey)) {
      throw new Error(`Teacher conflict in schedule seed: ${teacherSlotKey}`);
    }
    teacherSlotKeys.add(teacherSlotKey);
  }

  const enrollmentsByStudent = new Map<string, typeof activeEnrollmentSeeds>();
  for (const enrollment of activeEnrollmentSeeds) {
    if (!courseByCode.has(enrollment.course_code)) {
      throw new Error(
        `Course ${enrollment.course_code} is required for enrollment seed`,
      );
    }

    const currentEnrollments =
      enrollmentsByStudent.get(enrollment.student_id) || [];
    currentEnrollments.push(enrollment);
    enrollmentsByStudent.set(enrollment.student_id, currentEnrollments);
  }

  for (const [studentId, enrollments] of enrollmentsByStudent) {
    for (let i = 0; i < enrollments.length; i += 1) {
      for (let j = i + 1; j < enrollments.length; j += 1) {
        const leftCourse = courseByCode.get(enrollments[i].course_code)!;
        const rightCourse = courseByCode.get(enrollments[j].course_code)!;
        const leftSchedule = scheduleByCourseCode.get(
          enrollments[i].course_code,
        )!;
        const rightSchedule = scheduleByCourseCode.get(
          enrollments[j].course_code,
        )!;

        if (
          semesterKey(leftCourse.semester) ===
            semesterKey(rightCourse.semester) &&
          leftSchedule.dayOfWeek === rightSchedule.dayOfWeek &&
          schedulesOverlap(leftSchedule, rightSchedule)
        ) {
          throw new Error(
            `Student ${studentId} has schedule conflict between ${enrollments[i].course_code} and ${enrollments[j].course_code}`,
          );
        }
      }
    }
  }
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

async function main() {
  validateSeedData();

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

  await prisma.department.upsert({
    where: { department_id: 'DEFAULT' },
    update: {
      name: 'Khoa mac dinh',
      description: 'Khoa mac dinh cho du lieu cu',
    },
    create: {
      department_id: 'DEFAULT',
      name: 'Khoa mac dinh',
      description: 'Khoa mac dinh cho du lieu cu',
    },
  });

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
          department_id: 'DEFAULT',
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
        department_id: 'DEFAULT',
      },
      create: {
        teacher_id: profile.teacher_id,
        user_id: user.id,
        name: profile.name,
        degree: profile.degree,
        expertise: profile.expertise,
        department_id: 'DEFAULT',
      },
    });
  }

  for (const [index, user] of seededStudentUsers.entries()) {
    const profile = studentProfiles[index];
    await prisma.studentClass.upsert({
      where: { class_id: 'DEFAULT' },
      update: {
        name: 'Lớp mặc định',
        cohort: 'N/A',
        major: 'N/A',
        department_id: 'DEFAULT',
        capacity: null,
      },
      create: {
        class_id: 'DEFAULT',
        name: 'Lớp mặc định',
        cohort: 'N/A',
        major: 'N/A',
        department_id: 'DEFAULT',
        capacity: null,
      },
    });

    const existingStudent = await prisma.student.findUnique({
      where: { user_id: user.id },
    });

    if (existingStudent) {
      await prisma.student.update({
        where: { student_id: existingStudent.student_id },
        data: { name: profile.name, class_id: 'DEFAULT' },
      });
      continue;
    }

    await prisma.student.upsert({
      where: { student_id: profile.student_id },
      update: {
        user_id: user.id,
        name: profile.name,
        class_id: 'DEFAULT',
      },
      create: {
        student_id: profile.student_id,
        user_id: user.id,
        name: profile.name,
        class_id: 'DEFAULT',
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
        department_id: 'DEFAULT',
        is_general: false,
      },
      create: {
        ...subject,
        department_id: 'DEFAULT',
        is_general: false,
      },
    });
  }

  await prisma.semester.updateMany({ data: { is_active: false } });

  const semesterIdByKey = new Map<string, string>();
  for (const semesterSeed of semesterSeeds) {
    const semester = await prisma.semester.upsert({
      where: {
        name_school_year: {
          name: semesterSeed.name,
          school_year: semesterSeed.school_year,
        },
      },
      update: semesterSeed,
      create: semesterSeed,
    });

    semesterIdByKey.set(semesterKey(semesterSeed), semester.semester_id);
  }

  if (!semesterSeeds.some((semester) => semester.is_active)) {
    throw new Error('Active semester seed is required');
  }

  const inactiveManagedCourses = await prisma.course.findMany({
    where: {
      course_code: {
        in: managedCourseCodes.filter(
          (courseCode) => !activeCourseCodes.includes(courseCode),
        ),
      },
    },
    select: { course_id: true },
  });
  const inactiveManagedCourseIds = inactiveManagedCourses.map(
    (course) => course.course_id,
  );

  if (inactiveManagedCourseIds.length > 0) {
    await prisma.enrollment.deleteMany({
      where: { course_id: { in: inactiveManagedCourseIds } },
    });
    await prisma.schedule.deleteMany({
      where: { course_id: { in: inactiveManagedCourseIds } },
    });
    await prisma.course.deleteMany({
      where: { course_id: { in: inactiveManagedCourseIds } },
    });
  }

  for (const course of activeCourseSeeds) {
    const semesterId = semesterIdByKey.get(semesterKey(course.semester));
    if (!semesterId) {
      throw new Error(`Semester is required for course ${course.course_code}`);
    }

    await prisma.course.upsert({
      where: { course_code: course.course_code },
      update: {
        subject_id: course.subject_id,
        teacher_id: course.teacher_id,
        semester_id: semesterId,
        capacity: course.capacity,
        remaining_capacity: course.remaining_capacity,
        required_room_type: course.required_room_type,
      },
      create: {
        course_code: course.course_code,
        subject_id: course.subject_id,
        teacher_id: course.teacher_id,
        semester_id: semesterId,
        capacity: course.capacity,
        remaining_capacity: course.remaining_capacity,
        required_room_type: course.required_room_type,
      },
    });
  }

  const activeCourses = await prisma.course.findMany({
    where: { course_code: { in: activeCourseCodes } },
    select: { course_id: true },
  });
  const activeCourseIds = activeCourses.map((course) => course.course_id);

  await prisma.schedule.deleteMany({
    where: { course_id: { in: activeCourseIds } },
  });

  for (const scheduleSeed of activeScheduleSeeds) {
    const course = await prisma.course.findUnique({
      where: { course_code: scheduleSeed.course_code },
      select: {
        course_id: true,
        semester: {
          select: {
            start_date: true,
            end_date: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error(
        `Course ${scheduleSeed.course_code} is required for schedule seed`,
      );
    }

    const scheduleData = {
      course_id: course.course_id,
      classroom_id: scheduleSeed.classroom_id,
      dayOfWeek: scheduleSeed.dayOfWeek,
      start_slot: scheduleSeed.start_slot,
      end_slot: scheduleSeed.end_slot,
      start_date: course.semester.start_date,
      end_date: course.semester.end_date,
    };

    await prisma.schedule.create({ data: scheduleData });
  }

  for (const enrollmentSeed of activeEnrollmentSeeds) {
    const course = await prisma.course.findUnique({
      where: { course_code: enrollmentSeed.course_code },
      select: { course_id: true },
    });

    if (!course) {
      throw new Error(
        `Course ${enrollmentSeed.course_code} is required for enrollment seed`,
      );
    }

    await prisma.enrollment.upsert({
      where: {
        student_id_course_id: {
          student_id: enrollmentSeed.student_id,
          course_id: course.course_id,
        },
      },
      update: {},
      create: {
        student_id: enrollmentSeed.student_id,
        course_id: course.course_id,
      },
    });
  }

  const seededCourses = await prisma.course.findMany({
    where: {
      course_code: { in: activeCourseCodes },
    },
    select: {
      course_id: true,
      capacity: true,
    },
  });

  for (const course of seededCourses) {
    const enrollmentCount = await prisma.enrollment.count({
      where: { course_id: course.course_id },
    });

    await prisma.course.update({
      where: { course_id: course.course_id },
      data: {
        remaining_capacity:
          course.capacity === null
            ? null
            : Math.max(0, course.capacity - enrollmentCount),
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
