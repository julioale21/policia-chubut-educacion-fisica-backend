import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  surname: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'DNI must be exactly 8 digits' })
  dni: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
