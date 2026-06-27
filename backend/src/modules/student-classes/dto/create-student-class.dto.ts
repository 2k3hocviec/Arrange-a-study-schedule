export class CreateStudentClassDto {
  class_id!: string;
  name!: string;
  cohort!: string;
  major_id!: string;
  capacity?: number;
}
