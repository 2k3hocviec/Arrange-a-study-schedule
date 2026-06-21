import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTeacherBusyScheduleDto {
  @IsDateString()
  busy_date!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  start_slot!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  end_slot!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
