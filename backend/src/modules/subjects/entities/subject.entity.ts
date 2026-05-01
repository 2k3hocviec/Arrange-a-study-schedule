import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subject {
  @PrimaryColumn()
  subject_id!: string;

  @Column()
  name!: string;

  @Column()
  credits!: number;
}
