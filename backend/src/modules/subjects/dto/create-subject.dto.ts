export class CreateSubjectDto {
  subject_id!: string;
  name!: string;
  credits!: number;
  major_id!: string;
  allow_same_major?: boolean;
  allow_same_department?: boolean;
}
