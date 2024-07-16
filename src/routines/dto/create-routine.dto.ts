import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  slug: string;
}
