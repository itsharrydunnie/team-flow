import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Authorization endpoints',
    description: 'title of task',
  })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Implementing auth endpoints for Backend API',
    description: 'description of the task at hand',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: '{uuid}',
    description: 'User thats assigned the task',
  })
  assigneeId?: string;
}
