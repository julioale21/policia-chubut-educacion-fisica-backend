import { Excercise } from 'src/excercises/entities/excercise.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['routine', 'exercise'])
export class RoutineExcercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dayOfRoutine: number;

  @ManyToOne(() => Routine, (routine) => routine.routineExercises)
  routine: Routine;

  @ManyToOne(() => Excercise, (exercise) => exercise.routineExercises)
  exercise: Excercise;
}
