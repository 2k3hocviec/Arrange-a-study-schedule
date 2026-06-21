import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from 'src/role/roles.decorator';
import { CreateStudentClassDto } from './dto/create-student-class.dto';
import { UpdateStudentClassDto } from './dto/update-student-class.dto';
import { StudentClassesService } from './student-classes.service';

@Controller('student-classes')
export class StudentClassesController {
  constructor(private readonly studentClassesService: StudentClassesService) {}

  @Roles('ministry')
  @Post()
  create(@Body() createStudentClassDto: CreateStudentClassDto) {
    return this.studentClassesService.create(createStudentClassDto);
  }

  @Roles('ministry')
  @Get()
  findAll() {
    return this.studentClassesService.findAll();
  }

  @Roles('ministry')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentClassesService.findOne(id);
  }

  @Roles('ministry')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentClassDto: UpdateStudentClassDto,
  ) {
    return this.studentClassesService.update(id, updateStudentClassDto);
  }

  @Roles('ministry')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentClassesService.remove(id);
  }
}
