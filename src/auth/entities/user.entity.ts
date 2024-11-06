import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ValidRoles } from '../interfaces';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  surname: string;

  @Column({
    type: 'text',
    unique: true,
    nullable: true,
  })
  dni: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
  })
  password: string;

  @Column({
    type: 'bool',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ValidRoles,
    array: true,
    default: [ValidRoles.user],
  })
  roles: ValidRoles[];

  @OneToMany(() => RoutineAssignment, (assignment) => assignment.student)
  routineAssignments: RoutineAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
