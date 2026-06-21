import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { TeachersService } from '../teachers/teachers.service';
import { SubjectsService } from '../subjects/subjects.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SemestersService } from '../semesters/semesters.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teacherService: TeachersService,
    private readonly subjectService: SubjectsService,
    private readonly semestersService: SemestersService,
  ) {}

  private async generateCourseCode(subjectId: string) {
    const courses = await this.prisma.course.findMany({
      where: { subject_id: subjectId },
      select: { course_code: true },
    });

    const prefix = `${subjectId}-`;
    const maxGroupNumber = courses.reduce((max, course) => {
      if (!course.course_code?.startsWith(prefix)) {
        return max;
      }

      const groupNumber = Number(course.course_code.slice(prefix.length));
      return Number.isInteger(groupNumber) && groupNumber > max
        ? groupNumber
        : max;
    }, 0);

    return `${prefix}${String(maxGroupNumber + 1).padStart(2, '0')}`;
  }

  private async ensureCourseSchedulesFitSemester(
    courseId: string,
    semesterId?: string,
  ) {
    if (!semesterId) {
      return;
    }

    const semester = await this.semestersService.findOne(semesterId);
    if (!semester) {
      throw new BadRequestException('Semester not found');
    }

    const scheduleOutOfRange = await this.prisma.schedule.findFirst({
      where: {
        course_id: courseId,
        OR: [
          { start_date: null },
          { end_date: null },
          { start_date: { lt: semester.start_date } },
          { end_date: { gt: semester.end_date } },
        ],
      },
    });

    if (scheduleOutOfRange) {
      throw new BadRequestException(
        'Cannot move course to this semester because an existing schedule is outside the semester date range',
      );
    }
  }

  private ensureTeacherCanTeachSubject(
    teacher: { department_id?: string | null },
    subject: { department_id?: string | null },
  ) {
    if (teacher.department_id !== subject.department_id) {
      throw new BadRequestException(
        'Teacher department does not match subject department',
      );
    }
  }

  private hasCourseUpdateChanges(
    currentCourse: {
      course_code: string | null;
      subject_id: string;
      teacher_id: string;
      semester_id: string;
      capacity: number | null;
      required_room_type: string;
    },
    updateCourseDto: UpdateCourseDto,
  ) {
    const textFields: Array<
      keyof Pick<
        UpdateCourseDto,
        | 'course_code'
        | 'subject_id'
        | 'teacher_id'
        | 'semester_id'
        | 'required_room_type'
      >
    > = [
      'course_code',
      'subject_id',
      'teacher_id',
      'semester_id',
      'required_room_type',
    ];

    const hasTextFieldChange = textFields.some((field) => {
      if (updateCourseDto[field] === undefined) {
        return false;
      }

      return updateCourseDto[field] !== currentCourse[field];
    });

    if (hasTextFieldChange) {
      return true;
    }

    if (updateCourseDto.capacity === undefined) {
      return false;
    }

    return Number(updateCourseDto.capacity) !== currentCourse.capacity;
  }

  async create(createCourseDto: CreateCourseDto) {
    if (!createCourseDto.required_room_type) {
      throw new BadRequestException('Required room type is required');
    }

    if (!createCourseDto.semester_id) {
      throw new BadRequestException('Semester is required');
    }

    const teacher = await this.teacherService.findOne(
      createCourseDto.teacher_id,
    );
    const subject = await this.subjectService.findOne(
      createCourseDto.subject_id,
    );
    const semester = await this.semestersService.findOne(
      createCourseDto.semester_id,
    );

    if (!teacher || !subject || !semester) {
      throw new BadRequestException('Not teacher or Not subject or Not semester');
    }

    this.ensureTeacherCanTeachSubject(teacher, subject);

    const courseCode =
      createCourseDto.course_code?.trim() ||
      (await this.generateCourseCode(createCourseDto.subject_id));

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        course_code: courseCode,
        remaining_capacity: createCourseDto.capacity,
      },
    });
  }

  findAll() {
    return this.prisma.course.findMany({
      include: { subject: true, teacher: true, semester: true },
    });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { course_id: id },
      include: { semester: true },
    });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    if (updateCourseDto.required_room_type === '') {
      throw new BadRequestException('Required room type is required');
    }

    const currentCourse = await this.prisma.course.findUnique({
      where: { course_id: id },
      select: {
        course_code: true,
        subject_id: true,
        teacher_id: true,
        semester_id: true,
        capacity: true,
        required_room_type: true,
      },
    });

    if (!currentCourse) {
      throw new BadRequestException('Course not found');
    }

    const scheduleCount = await this.prisma.schedule.count({
      where: { course_id: id },
    });

    if (
      scheduleCount > 0 &&
      this.hasCourseUpdateChanges(currentCourse, updateCourseDto)
    ) {
      throw new BadRequestException('Cannot update course that has schedule');
    }

    const teacher = await this.teacherService.findOne(
      updateCourseDto.teacher_id || currentCourse.teacher_id,
    );
    const subject = await this.subjectService.findOne(
      updateCourseDto.subject_id || currentCourse.subject_id,
    );
    const semester = updateCourseDto.semester_id
      ? await this.semestersService.findOne(updateCourseDto.semester_id)
      : true;
    if (!teacher || !subject || !semester) {
      throw new BadRequestException('Not teacher or Not subject or Not semester');
    }

    this.ensureTeacherCanTeachSubject(teacher, subject);

    if (updateCourseDto.semester_id) {
      await this.ensureCourseSchedulesFitSemester(
        id,
        updateCourseDto.semester_id,
      );
    }

    if (updateCourseDto.capacity !== undefined) {
      const enrollmentCount = await this.prisma.enrollment.count({
        where: { course_id: id },
      });

      if (enrollmentCount > updateCourseDto.capacity) {
        throw new BadRequestException(
          `Cannot update capacity to ${updateCourseDto.capacity}. There are already ${enrollmentCount} students enrolled. Capacity must be at least ${enrollmentCount}.`,
        );
      }

      return this.prisma.course.update({
        where: { course_id: id },
        data: {
          ...updateCourseDto,
          remaining_capacity: updateCourseDto.capacity - enrollmentCount,
        },
      });
    }

    return this.prisma.course.update({
      where: { course_id: id },
      data: updateCourseDto,
    });
  }

  async remove(id: string) {
    const [scheduleCount, enrollmentCount] = await Promise.all([
      this.prisma.schedule.count({ where: { course_id: id } }),
      this.prisma.enrollment.count({ where: { course_id: id } }),
    ]);

    if (scheduleCount > 0) {
      throw new BadRequestException('Cannot delete course that has schedules');
    }

    if (enrollmentCount > 0) {
      throw new BadRequestException('Cannot delete course that has enrollments');
    }

    return this.prisma.course.delete({ where: { course_id: id } });
  }

  async findOneByCourseID(courseId: string) {
    return this.prisma.course.findUnique({
      where: { course_id: courseId },
      include: { semester: true },
    });
  }

  async findOneByCourseIDWithSubject(courseId: string) {
    return this.prisma.course.findUnique({
      where: { course_id: courseId },
      include: { subject: true, semester: true },
    });
  }

  async updateRemaining(courseId: string, remainingCapacity: number) {
    return this.prisma.course.update({
      where: { course_id: courseId },
      data: { remaining_capacity: remainingCapacity },
    });
  }

  async findInfoCourse() {
    const activeSemester = await this.semestersService.findActive();
    if (!activeSemester) {
      return [];
    }

    return this.prisma.course.findMany({
      where: { semester_id: activeSemester.semester_id },
      select: {
        course_id: true,
        course_code: true,
        semester_id: true,
        capacity: true,
        remaining_capacity: true,
        required_room_type: true,
        semester: {
          select: {
            semester_id: true,
            name: true,
            school_year: true,
            start_date: true,
            end_date: true,
            is_active: true,
          },
        },
        subject: {
          select: {
            subject_id: true,
            name: true,
            credits: true,
            department_id: true,
            is_general: true,
          },
        },
        teacher: {
          select: {
            teacher_id: true,
            name: true,
            department_id: true,
          },
        },
        schedule: {
          select: {
            schedule_id: true,
            dayOfWeek: true,
            start_slot: true,
            end_slot: true,
            start_date: true,
            end_date: true,
          },
        },
      },
    });
  }
}
