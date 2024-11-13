import { IsString, IsOptional } from 'class-validator';
import { EmergencyContact } from '../interfaces/medical-info.interface';

export class EmergencyContactDto implements EmergencyContact {
  @IsString()
  @IsOptional()
  name!: string;

  @IsString()
  @IsOptional()
  phone!: string;

  @IsString()
  @IsOptional()
  relationship!: string;
}
