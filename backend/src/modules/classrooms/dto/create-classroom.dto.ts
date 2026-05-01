import { IsString, IsNumber, IsEnum, IsPositive } from 'class-validator';

export class CreateClassroomDto {
  id!: string;
  capacity!: number;
  type!: string;
  description!: string;
  status!: string;
}
