import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/role/roles.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles('admin')
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get('me')
  @Roles('student')
  getMyInfo(@Request() req) {
    return this.studentsService.findByUserId(req.user.sub);
  }

  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOneByStudentID(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
