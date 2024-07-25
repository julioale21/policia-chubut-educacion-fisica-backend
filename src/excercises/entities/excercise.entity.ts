import { ExerciseCategory } from 'src/common/enums/excersises-category.enum';
import { RoutineExcercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Excercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  repetitions: number;

  @Column({
    type: 'enum',
    enum: ExerciseCategory,
    default: ExerciseCategory.STRENGTH,
  })
  category: string;

  @Column()
  restTimeBetweenSets: number;

  @OneToMany(
    () => RoutineExcercise,
    (routineExercise) => routineExercise.exercise,
  )
  routineExercises: RoutineExcercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
