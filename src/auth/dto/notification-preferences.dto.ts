import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationPreferencesDto {
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @IsBoolean()
  @IsOptional()
  push?: boolean;

  @IsBoolean()
  @IsOptional()
  routineReminders?: boolean;
}
