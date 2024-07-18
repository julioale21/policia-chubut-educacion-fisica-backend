import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RoutineAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => User, (user) => user.routineAssignments)
  user: User;

  @ManyToOne(() => Routine, (routine) => routine.routineAssignments)
  routine: Routine;

  @OneToMany(
    () => ExerciseCompletion,
    (completion) => completion.routineAssignment,
  )
  exerciseCompletions: ExerciseCompletion[];
}
