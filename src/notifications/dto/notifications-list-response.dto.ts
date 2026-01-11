import { Notification } from '../entities/notification.entity';

export class NotificationsListResponseDto {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}
