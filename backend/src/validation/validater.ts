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
