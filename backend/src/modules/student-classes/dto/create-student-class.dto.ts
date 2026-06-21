export class CreateStudentClassDto {
  class_id!: string;
  name!: string;
  cohort!: string;
  major!: string;
  capacity?: number;
}
