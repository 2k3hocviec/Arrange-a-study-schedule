import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectTeacherBusyScheduleDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reject_reason?: string;
}
