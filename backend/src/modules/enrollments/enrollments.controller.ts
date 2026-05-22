import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Student } from '../students/entities/student.entity';
import { Roles } from 'src/role/roles.decorator';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles('ministry', 'student')
  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Roles('ministry')
  @Get()
  findAllEnrollCourse() {
    return this.enrollmentsService.findAllEnrollCourse();
  }

  @Roles('ministry', 'student')
  @Get('student/:id')
  findEnrollOfStudentId(@Param('id') id: string) {
    return this.enrollmentsService.findEnrollOfStudentId(id);
  }

  @Roles('ministry', 'student')
  @Get('student/:id/courses-details')
  findStudentCoursesWithDetails(@Param('id') studentId: string) {
    return this.enrollmentsService.findStudentCoursesWithDetails(studentId);
  }

  @Roles('ministry', 'student')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(+id);
  }

  @Roles('ministry', 'student')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(+id, updateEnrollmentDto);
  }

  @Roles('ministry', 'student')
  @Delete('del')
  remove(@Body() body: { student_id: string; course_id: string }) {
    return this.enrollmentsService.remove({
      studentId: body.student_id,
      courseId: body.course_id,
    });
  }
}
