import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum NotificationType {
  GENERAL = 'general',
  ROUTINE_REMINDER = 'routine_reminder',
  EXERCISE_COMPLETED = 'exercise_completed',
  ROUTINE_ASSIGNED = 'routine_assigned',
  ACHIEVEMENT = 'achievement',
  EXAM_DATE = 'exam_date',
  EXAM_PERIOD = 'exam_period',
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.GENERAL,
  })
  type: NotificationType;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'bool', default: false })
  isRead: boolean;

  @Column({ type: 'bool', default: false })
  isSent: boolean;

  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
