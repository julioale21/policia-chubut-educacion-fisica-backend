import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
  })
  surname: string;

  @Column({
    type: 'text',
    unique: true,
  })
  dni: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @OneToMany(() => RoutineAssignment, (assignment) => assignment.user)
  routineAssignments: RoutineAssignment[];
}
