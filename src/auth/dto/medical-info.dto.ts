import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { EmergencyContactDto } from './emergency-contact.dto';
import { Type } from 'class-transformer';

export class MedicalInfoDto {
  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  conditions?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;
}
