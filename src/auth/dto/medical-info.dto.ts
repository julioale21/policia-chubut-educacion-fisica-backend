import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
} from 'class-validator';
import { EmergencyContactDto } from './emergency-contact.dto';
import { Type } from 'class-transformer';
import { MedicalInfo } from '../interfaces/medical-info.interface';

export class MedicalInfoDto implements Partial<MedicalInfo> {
  @IsString()
  @IsOptional()
  @Matches(/^(A|B|AB|O)[+-]?$/)
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
