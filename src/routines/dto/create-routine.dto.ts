import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsOptional()
  durationInDays?: number;

  @IsBoolean()
  @IsOptional()
  isGeneral?: boolean;
}
