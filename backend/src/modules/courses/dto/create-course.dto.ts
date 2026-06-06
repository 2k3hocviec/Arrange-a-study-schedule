export class CreateCourseDto {
  course_code?: string;
  subject_id!: string;
  teacher_id!: string;
  semester_id!: string;
  capacity?: number;
  required_room_type!: string;
}
