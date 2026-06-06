export class CreateSemesterDto {
  name!: string;
  school_year!: string;
  start_date!: string;
  end_date!: string;
  is_active?: boolean;
}
