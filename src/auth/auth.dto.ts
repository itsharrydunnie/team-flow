import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
  ValidationArguments,
} from 'class-validator';

export class AuthDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, {
    message: 'Password must be atleast 8 character',
  })
  @IsStrongPassword()
  password!: string;
}

[];
