import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { Roles } from 'src/role/roles.decorator';
import { CreateTeacherBusyScheduleDto } from './dto/create-teacher-busy-schedule.dto';
import { RejectTeacherBusyScheduleDto } from './dto/reject-teacher-busy-schedule.dto';
import { TeacherBusySchedulesService } from './teacher-busy-schedules.service';

@Controller('teacher-busy-schedules')
export class TeacherBusySchedulesController {
  constructor(
    private readonly teacherBusySchedulesService: TeacherBusySchedulesService,
  ) {}

  private getUserId(req: any) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User token not found');
    }

    return userId;
  }

  @Roles('teacher')
  @Get('me')
  findMine(@Request() req) {
    return this.teacherBusySchedulesService.findMine(this.getUserId(req));
  }

  @Roles('ministry')
  @Get()
  findAll(@Query('status') status?: string) {
    return this.teacherBusySchedulesService.findAll(status);
  }

  @Roles('teacher')
  @Post()
  createMine(
    @Request() req,
    @Body() createBusyDto: CreateTeacherBusyScheduleDto,
  ) {
    return this.teacherBusySchedulesService.createMine(
      this.getUserId(req),
      createBusyDto,
    );
  }

  @Roles('teacher')
  @Delete(':id')
  removeMine(@Request() req, @Param('id') id: string) {
    return this.teacherBusySchedulesService.removeMine(this.getUserId(req), id);
  }

  @Roles('ministry')
  @Patch(':id/approve')
  approve(@Request() req, @Param('id') id: string) {
    return this.teacherBusySchedulesService.approve(id, this.getUserId(req));
  }

  @Roles('ministry')
  @Patch(':id/reject')
  reject(
    @Request() req,
    @Param('id') id: string,
    @Body() rejectDto: RejectTeacherBusyScheduleDto,
  ) {
    return this.teacherBusySchedulesService.reject(
      id,
      this.getUserId(req),
      rejectDto,
    );
  }
}
