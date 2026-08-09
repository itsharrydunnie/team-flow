import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'TeamFlow Backend',
    description: 'Name of the project',
  })
  name!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Backend API for TeamFlow',
    description: 'Project description',
  })
  description?: string;
}
