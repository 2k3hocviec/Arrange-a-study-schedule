import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { CreateScheduleDto } from 'src/modules/schedules/dto/create-schedule.dto';

export function IsValidSlotRange(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidSlotRange',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const dto = args.object as CreateScheduleDto;
          return dto.start_slot <= dto.end_slot;
        },
        defaultMessage() {
          return 'start_slot must be less than end_slot';
        },
      },
    });
  };
}

export function IsValidDateRange(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateRange',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const dto = args.object as CreateScheduleDto;
          // Nếu cả hai ngày đều không có, là hợp lệ
          if (!dto.start_date || !dto.end_date) {
            return true;
          }
          // Nếu có cả hai, start_date phải <= end_date
          return new Date(dto.start_date) <= new Date(dto.end_date);
        },
        defaultMessage() {
          return 'start_date must be less than or equal to end_date';
        },
      },
    });
  };
}
