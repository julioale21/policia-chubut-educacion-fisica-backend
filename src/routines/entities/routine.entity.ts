import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { RoutineExcercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  durationInDays: number;

  @Column({ default: false })
  isGeneral: boolean;

  @OneToMany(() => RoutineAssignment, (assignment) => assignment.routine)
  routineAssignments: RoutineAssignment[];

  @OneToMany(
    () => RoutineExcercise,
    (routineExercise) => routineExercise.routine,
  )
  routineExercises: RoutineExcercise[];
}
