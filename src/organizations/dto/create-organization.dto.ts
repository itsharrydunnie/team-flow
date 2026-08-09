import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'CloseAI',
    description: 'Name of your organization',
  })
  name!: 'string';
}
