import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../org.enum';

export class InviteMemberDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(Role)
  role!: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(Role)
  role!: string;
}
