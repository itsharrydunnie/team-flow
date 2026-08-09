import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'me@email.com',
    description: 'Email address of the new user',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be atleast 8 character',
  })
  @IsStrongPassword()
  @ApiProperty({
    example: 'StrongPassword1#',
    description: 'Password meeting all requirements',
  })
  password!: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'me@email.com',
    description: 'Email address of the new user',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'StrongPassword1#',
    description: 'Password meeting all requirements',
  })
  password!: string;
}
