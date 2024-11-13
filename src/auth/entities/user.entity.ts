import { RoutineAssignment } from 'src/routine-assignments/entities/routine-assignment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ValidRoles } from '../interfaces';
import { MedicalInfo } from '../interfaces/medical-info.interface';

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

  @Column({
    type: 'date',
    nullable: true,
  })
  birthDate?: Date;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  height?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  initialWeight?: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  phone?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastLogin?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  profileImageUrl?: string;

  @Index()
  @Column({
    type: 'text',
    nullable: true,
  })
  force?: string;

  @Column({
    nullable: true,
    type: 'jsonb',
  })
  medicalInfo?: MedicalInfo;

  @OneToMany(() => RoutineAssignment, (assignment) => assignment.student)
  routineAssignments: RoutineAssignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
