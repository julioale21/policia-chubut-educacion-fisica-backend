import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { UserFcmToken } from './entities/user-fcm-token.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { NotificationsListResponseDto } from './dto/notifications-list-response.dto';
import { FirebaseAdminService } from './services/firebase-admin.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(UserFcmToken)
    private readonly fcmTokenRepository: Repository<UserFcmToken>,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  async getUserNotifications(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<NotificationsListResponseDto> {
    const [notifications, totalCount] =
      await this.notificationRepository.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
      totalCount,
    };
  }

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...dto,
      type: dto.type || NotificationType.GENERAL,
    });
    return await this.notificationRepository.save(notification);
  }

  async createAndSend(dto: SendNotificationDto): Promise<{
    notification: Notification | null;
    sentCount: number;
    failedCount: number;
  }> {
    let targetUserIds: string[] = [];

    if (dto.userId) {
      targetUserIds = [dto.userId];
    } else if (dto.userIds && dto.userIds.length > 0) {
      targetUserIds = dto.userIds;
    } else {
      // Send to all users with active tokens
      const allTokens = await this.fcmTokenRepository.find({
        where: { isActive: true },
        select: ['userId'],
      });
      targetUserIds = [...new Set(allTokens.map((t) => t.userId))];
    }

    if (targetUserIds.length === 0) {
      this.logger.warn('No target users found for notification');
      return { notification: null, sentCount: 0, failedCount: 0 };
    }

    // Create notifications in database for each user
    const notifications = targetUserIds.map((userId) =>
      this.notificationRepository.create({
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        type: dto.type || NotificationType.GENERAL,
        data: dto.data,
        userId,
      }),
    );

    const savedNotifications =
      await this.notificationRepository.save(notifications);

    // Get all active tokens for target users
    const tokens = await this.fcmTokenRepository.find({
      where: { userId: In(targetUserIds), isActive: true },
    });

    if (tokens.length === 0) {
      this.logger.warn('No active FCM tokens found for target users');
      return {
        notification: savedNotifications[0] || null,
        sentCount: 0,
        failedCount: 0,
      };
    }

    // Send push notifications
    const tokenStrings = tokens.map((t) => t.token);
    const dataAsStrings = dto.data
      ? Object.fromEntries(
          Object.entries(dto.data).map(([k, v]) => [k, String(v)]),
        )
      : undefined;

    const response = await this.firebaseAdmin.sendToMultipleDevices(
      tokenStrings,
      {
        title: dto.title,
        body: dto.body,
        imageUrl: dto.imageUrl,
        data: dataAsStrings,
      },
    );

    let sentCount = 0;
    let failedCount = 0;

    if (response) {
      sentCount = response.successCount;
      failedCount = response.failureCount;

      // Mark invalid tokens as inactive
      const invalidTokens = this.firebaseAdmin.getFailedTokensFromBatchResponse(
        tokenStrings,
        response,
      );
      if (invalidTokens.length > 0) {
        await this.fcmTokenRepository.update(
          { token: In(invalidTokens) },
          { isActive: false },
        );
        this.logger.debug(`Marked ${invalidTokens.length} tokens as inactive`);
      }

      // Mark notifications as sent
      const notificationIds = savedNotifications.map((n) => n.id);
      await this.notificationRepository.update(
        { id: In(notificationIds) },
        { isSent: true },
      );
    }

    return {
      notification: savedNotifications[0] || null,
      sentCount,
      failedCount,
    };
  }

  async sendPushToUser(
    userId: string,
    notification: { title: string; body: string; data?: Record<string, any> },
  ): Promise<boolean> {
    const tokens = await this.fcmTokenRepository.find({
      where: { userId, isActive: true },
    });

    if (tokens.length === 0) {
      return false;
    }

    const tokenStrings = tokens.map((t) => t.token);
    const dataAsStrings = notification.data
      ? Object.fromEntries(
          Object.entries(notification.data).map(([k, v]) => [k, String(v)]),
        )
      : undefined;

    const response = await this.firebaseAdmin.sendToMultipleDevices(
      tokenStrings,
      {
        title: notification.title,
        body: notification.body,
        data: dataAsStrings,
      },
    );

    if (response) {
      const invalidTokens = this.firebaseAdmin.getFailedTokensFromBatchResponse(
        tokenStrings,
        response,
      );
      if (invalidTokens.length > 0) {
        await this.fcmTokenRepository.update(
          { token: In(invalidTokens) },
          { isActive: false },
        );
      }
      return response.successCount > 0;
    }

    return false;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return { count: result.affected || 0 };
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.notificationRepository.remove(notification);
  }

  async updateFcmToken(
    userId: string,
    dto: UpdateFcmTokenDto,
  ): Promise<UserFcmToken> {
    // Check if token already exists
    let fcmToken = await this.fcmTokenRepository.findOne({
      where: { token: dto.token },
    });

    if (fcmToken) {
      // Update existing token (might be associated with different user)
      fcmToken.userId = userId;
      fcmToken.deviceType = dto.deviceType || fcmToken.deviceType;
      fcmToken.isActive = true;
    } else {
      // Create new token
      fcmToken = this.fcmTokenRepository.create({
        token: dto.token,
        userId,
        deviceType: dto.deviceType,
        isActive: true,
      });
    }

    return await this.fcmTokenRepository.save(fcmToken);
  }

  async removeFcmToken(token: string): Promise<void> {
    await this.fcmTokenRepository.update({ token }, { isActive: false });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}
