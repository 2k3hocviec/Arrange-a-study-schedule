import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Teacher {
  @OneToOne(() => User, (user) => user.teacher)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  user_id!: number;

  @PrimaryColumn({ unique: true })
  teacher_id!: string;

  @Column()
  name!: string;
  @Column()
  degree!: string;

  @Column()
  expertise!: string;
}
