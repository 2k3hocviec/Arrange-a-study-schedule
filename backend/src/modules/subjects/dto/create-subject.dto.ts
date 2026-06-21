export class CreateSubjectDto {
  subject_id!: string;
  name!: string;
  credits!: number;
  department_id!: string;
  is_general?: boolean;
}
