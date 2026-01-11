import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { NotificationsListResponseDto } from './dto/notifications-list-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user-decorator';
import { ValidRoles } from '../auth/interfaces';
import { User } from '../auth/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get user notifications (paginated)
   * Auth: User
   */
  @Get()
  @Auth(ValidRoles.user)
  async getUserNotifications(
    @GetUser() user: User,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<NotificationsListResponseDto> {
    return this.notificationsService.getUserNotifications(
      user.id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * Get unread count
   * Auth: User
   */
  @Get('unread-count')
  @Auth(ValidRoles.user)
  async getUnreadCount(@GetUser() user: User) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { unreadCount: count };
  }

  /**
   * Create and send notification
   * Auth: Admin or Trainer
   */
  @Post()
  @Auth(ValidRoles.admin, ValidRoles.trainer, ValidRoles.supeUser)
  async createAndSend(@Body() dto: SendNotificationDto) {
    return this.notificationsService.createAndSend(dto);
  }

  /**
   * Update FCM token
   * Auth: User
   */
  @Post('token')
  @Auth(ValidRoles.user)
  async updateFcmToken(@GetUser() user: User, @Body() dto: UpdateFcmTokenDto) {
    return this.notificationsService.updateFcmToken(user.id, dto);
  }

  /**
   * Mark notification as read
   * Auth: User
   */
  @Patch(':id/read')
  @Auth(ValidRoles.user)
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  /**
   * Mark all notifications as read
   * Auth: User
   */
  @Patch('read-all')
  @Auth(ValidRoles.user)
  async markAllAsRead(@GetUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  /**
   * Delete notification
   * Auth: User
   */
  @Delete(':id')
  @Auth(ValidRoles.user)
  async delete(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    await this.notificationsService.delete(id, user.id);
    return { message: 'Notification deleted' };
  }
}
