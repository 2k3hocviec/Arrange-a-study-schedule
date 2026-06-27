export class Course {
  course_id!: string;
  subject_id!: string;
  teacher_id!: string;
  semester_id!: string;
  capacity?: number | null;
  remaining_capacity?: number | null;
}
