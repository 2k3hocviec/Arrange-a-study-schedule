export class CreateStudentClassDto {
  class_id!: string;
  name!: string;
  cohort!: string;
  major!: string;
  department_id!: string;
  capacity?: number;
}
