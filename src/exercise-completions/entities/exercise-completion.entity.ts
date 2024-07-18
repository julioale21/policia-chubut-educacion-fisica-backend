import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Excercise } from 'src/excercises/entities/excercise.entity';
import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';

@Entity()
export class ExerciseCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Excercise)
  exercise: Excercise;

  @Column()
  completionDate: Date;

  @Column()
  actualRepetitions: number;

  @Column()
  actualDuration: number;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(
    () => RoutineAssignment,
    (assignment) => assignment.exerciseCompletions,
  )
  routineAssignment: RoutineAssignment;
}
