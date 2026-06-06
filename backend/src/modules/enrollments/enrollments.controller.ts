import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Roles } from 'src/role/roles.decorator';
import { StudentsService } from '../students/students.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly studentsService: StudentsService,
  ) {}

  private async ensureStudentCanAccess(req: any, studentId: string) {
    if (req.user?.role === 'ministry') {
      return;
    }

    const currentStudent = await this.studentsService.findByUserId(req.user.sub);
    if (currentStudent.student_id !== studentId) {
      throw new ForbiddenException('You can only access your own enrollment');
    }
  }

  @Roles('ministry', 'student')
  @Post()
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @Request() req,
  ) {
    await this.ensureStudentCanAccess(req, createEnrollmentDto.student_id);
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Roles('ministry')
  @Get()
  findAllEnrollCourse() {
    return this.enrollmentsService.findAllEnrollCourse();
  }

  @Roles('ministry', 'student')
  @Get('student/:id')
  async findEnrollOfStudentId(@Param('id') id: string, @Request() req) {
    await this.ensureStudentCanAccess(req, id);
    return this.enrollmentsService.findEnrollOfStudentId(id);
  }

  @Roles('ministry', 'student')
  @Get('student/:id/courses-details')
  async findStudentCoursesWithDetails(
    @Param('id') studentId: string,
    @Request() req,
  ) {
    await this.ensureStudentCanAccess(req, studentId);
    return this.enrollmentsService.findStudentCoursesWithDetails(studentId);
  }

  @Roles('ministry')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(+id);
  }

  @Roles('ministry')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(+id, updateEnrollmentDto);
  }

  @Roles('ministry', 'student')
  @Delete('del')
  async remove(
    @Body() body: { student_id: string; course_id: string },
    @Request() req,
  ) {
    await this.ensureStudentCanAccess(req, body.student_id);
    return this.enrollmentsService.remove({
      studentId: body.student_id,
      courseId: body.course_id,
    });
  }
}
