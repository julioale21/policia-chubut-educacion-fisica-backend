import { User } from 'src/auth/entities/user.entity';
import { ExerciseCompletion } from 'src/exercise-completions/entities/exercise-completion.entity';
import { Routine } from 'src/routines/entities/routine.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
