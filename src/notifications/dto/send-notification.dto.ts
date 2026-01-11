import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsObject,
  IsArray,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  userId?: string; // If null, send to all users

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  userIds?: string[]; // Send to specific users
}
