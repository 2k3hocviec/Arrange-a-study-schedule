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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/role/roles.decorator';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { RoleGuard } from 'src/guard/role.guard';
import { Public } from 'src/role/public.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  @Roles('sysadmin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles('sysadmin', 'ministry')
  @Get('available-students')
  getAvailableStudents() {
    return this.usersService.getAvailableStudents();
  }

  @Roles('sysadmin', 'ministry')
  @Get('available-teachers')
  getAvailableTeachers() {
    return this.usersService.getAvailableTeachers();
  }
  @Roles('sysadmin', 'ministry')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles('sysadmin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  @Roles('sysadmin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  @Roles('sysadmin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
