import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Classroom {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  roomName!: string;

  @Column({ nullable: true })
  capacity!: number;
}
