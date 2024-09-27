import { User } from 'src/auth/entities/user.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Routine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({ type: 'int' })
  durationInDays: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  trainer: User;

  @OneToMany(() => RoutineAssignment, (assignment) => assignment.routine)
  routineAssignments: RoutineAssignment[];

  @OneToMany(
    () => RoutineExercise,
    (routineExercise) => routineExercise.routine,
  )
  routineExercises: RoutineExercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
