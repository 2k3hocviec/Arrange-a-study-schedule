import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Classroom {
  @PrimaryColumn({ unique: true })
  id!: string;

  @Column()
  capacity!: number;

  @Column({ type: 'enum', enum: ['Theory', 'Practice'] })
  type!: string;

  @Column()
  description!: string;

  @Column({ type: 'enum', enum: ['Ready', 'Maintaince', 'Used'] })
  status!: string;
}
