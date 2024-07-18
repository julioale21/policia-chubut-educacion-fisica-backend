import { RoutineExcercise } from 'src/routine-excercises/entities/routine-excercise.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Excercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  duration: number;

  @Column()
  repetitions: number;

  @Column()
  category: string;

  @Column()
  restTimeBetweenSets: number;

  @OneToMany(
    () => RoutineExcercise,
    (routineExercise) => routineExercise.exercise,
  )
  routineExercises: RoutineExcercise[];
}
