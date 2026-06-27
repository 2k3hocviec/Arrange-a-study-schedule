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
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { SemestersService } from './semesters.service';

@Controller('semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Roles('ministry')
  @Post()
  create(@Body() createSemesterDto: CreateSemesterDto) {
    return this.semestersService.create(createSemesterDto);
  }

  @Roles('ministry')
  @Get()
  findAll() {
    return this.semestersService.findAll();
  }

  @Roles('ministry', 'student', 'teacher')
  @Get('active')
  findActive() {
    return this.semestersService.findActive();
  }

  /*
    Sửa đổi thông tin của kì học, yêu cầu: 
      - Kì học phải tồn tại.
      - Thay đổi thời gian, đảm bảo: 
        + Thời gian bắt đầu phải nhỏ hơn tất cả thời gian bắt đầu của các khóa học trong kì.
        + Thời gian kết thức phải lớn hơn tất cả thời gian bắt đầu của các khóa học trong kì.
    */
  @Roles('ministry')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    return this.semestersService.update(id, updateSemesterDto);
  }

  @Roles('ministry')
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.semestersService.activate(id);
  }

  @Roles('ministry')
  @Patch(':id/register')
  setRegisterStatus(
    @Param('id') id: string,
    @Body() body: { is_register: boolean },
  ) {
    return this.semestersService.setRegisterStatus(id, body.is_register);
  }

  @Roles('ministry')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.semestersService.remove(id);
  }
}
