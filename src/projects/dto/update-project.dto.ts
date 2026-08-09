import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'TeamFlow Frontend',
    description: 'Change of the project name',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'User Interface for TeamFlow',
    description: 'Change of the project description',
  })
  description?: string;
}
