import { Schedule } from 'src/modules/schedules/entities/schedule.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Classroom {
  @PrimaryColumn({ unique: true })
  classroom_id!: string;

  @Column()
  capacity!: number;

  @Column({ type: 'enum', enum: ['Theory', 'Practice'] })
  type!: string;

  @Column()
  description!: string;

  @Column({ type: 'enum', enum: ['Ready', 'Maintaince', 'Used'] })
  status!: string;

  @OneToMany(() => Schedule, (schedule) => schedule.room)
  schedule!: Schedule[];
}
