import { Exercise } from 'src/excercises/entities/excercise.entity';
import { Routine } from 'src/routines/entities/routine.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Unique(['routine', 'exercise'])
@Entity()
export class RoutineExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dayOfRoutine: number;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  repetitions: number;

  @Column()
  restTimeBetweenSets: number;

  @ManyToOne(() => Routine, (routine) => routine.routineExercises)
  routine: Routine;

  @ManyToOne(() => Exercise, (exercise) => exercise.routineExercises)
  exercise: Exercise;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
