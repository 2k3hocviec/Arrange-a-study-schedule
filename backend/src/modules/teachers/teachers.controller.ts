import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Roles } from 'src/role/roles.decorator';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Roles('ministry')
  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }
  @Roles('ministry')
  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @Get('me')
  @Roles('teacher')
  getMyInfo(@Request() req) {
    return this.teachersService.findByUserId(req.user.sub);
  }

  @Get('allid')
  @Roles('ministry')
  getAllId() {
    return this.teachersService.findAllId();
  }

  @Get('teacher/:id/courses-details')
  findStudentCoursesWithDetails(@Param('id') teacherId: string) {
    return this.teachersService.findTeacherCoursesWithDetails(teacherId);
  }

  @Roles('ministry')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Roles('ministry')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Roles('ministry')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teachersService.remove(id);
  }
}
