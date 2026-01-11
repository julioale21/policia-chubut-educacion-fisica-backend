import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsString()
  deviceType?: string; // 'android', 'ios'
}
