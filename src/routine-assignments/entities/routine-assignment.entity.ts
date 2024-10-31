import { User } from 'src/auth/entities/user.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique('unique_student_routine_dates', [
  'student',
  'routine',
  'startDate',
  'endDate',
])
export class RoutineAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => User, (user) => user.routineAssignments)
  student: User;

  @ManyToOne(() => Routine, (routine) => routine.routineAssignments)
  routine: Routine;

  @OneToMany(
    () => ExerciseCompletion,
    (completion) => completion.routineAssignment,
  )
  exerciseCompletions: ExerciseCompletion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
