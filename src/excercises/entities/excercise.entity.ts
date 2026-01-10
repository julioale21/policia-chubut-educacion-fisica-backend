import { ExerciseCategory } from 'src/common/enums/excersises-category.enum';
import { RoutineExercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl?: string | null;

  @Column({
    type: 'enum',
    enum: ExerciseCategory,
    default: ExerciseCategory.FUERZA,
  })
  category: ExerciseCategory;

  @Column({ nullable: true })
  difficulty?: string; // Principiante, Intermedio, Avanzado

  @Column('simple-array', { nullable: true })
  muscleGroups?: string[]; // ['Pecho', 'Tríceps', 'Hombros']

  @Column('simple-array', { nullable: true })
  instructions?: string[]; // Pasos del ejercicio

  @OneToMany(
    () => RoutineExercise,
    (routineExercise) => routineExercise.exercise,
  )
  routineExercises: RoutineExercise[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
