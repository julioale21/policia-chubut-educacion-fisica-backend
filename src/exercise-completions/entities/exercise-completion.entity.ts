import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exercise } from 'src/excercises/entities/excercise.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';

@Entity()
export class ExerciseCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: true })
  completionDate: string;

  @Column({ nullable: true })
  actualRepetitions: number;

  @Column({ nullable: true })
  actualDuration: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => Exercise)
  exercise: Exercise;

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
