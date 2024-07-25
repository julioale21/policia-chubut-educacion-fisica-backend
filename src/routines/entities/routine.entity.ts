import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { RoutineExcercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
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

  @Column({ type: 'int', nullable: true })
  durationInDays: number;

  @Column({ default: true })
  isGeneral?: boolean;

  @OneToMany(() => RoutineAssignment, (assignment) => assignment.routine)
  routineAssignments: RoutineAssignment[];

  @OneToMany(
    () => RoutineExcercise,
    (routineExercise) => routineExercise.routine,
  )
  routineExercises: RoutineExcercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
