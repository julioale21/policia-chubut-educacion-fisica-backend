import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';

@Entity()
export class ExerciseCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  completionDate: Date;

  @Column({ default: true })
  isCompleted: boolean;

  @Column({ nullable: true })
  actualRepetitions: number;

  @Column({ nullable: true })
  actualDuration: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => RoutineExercise)
  routineExercise: RoutineExercise;

  @ManyToOne(
    () => RoutineAssignment,
    (assignment) => assignment.exerciseCompletions,
  )
  routineAssignment: RoutineAssignment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
