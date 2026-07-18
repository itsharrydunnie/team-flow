import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, {
    message:
      'Password must be atleast 8 character, must contain atleast 1 uppercase, 1 number, 1 special character',
  })
  password: string;
}

[];
