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

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('student/:id')
  findEnrollOfStudentId(@Param('id') id: string) {
    return this.enrollmentsService.findEnrollOfStudentId(id);
  }

  @Get('student/:id/courses-details')
  findStudentCoursesWithDetails(@Param('id') studentId: string) {
    return this.enrollmentsService.findStudentCoursesWithDetails(studentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(+id, updateEnrollmentDto);
  }

  @Delete('del')
  remove(@Body() body: { student_id: string; course_id: string }) {
    return this.enrollmentsService.remove({
      studentId: body.student_id,
      courseId: body.course_id,
    });
  }
}
