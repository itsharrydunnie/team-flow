import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Auth endpoints',
    description: 'title of task',
  })
  title!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'Implementing auth endpoints for Backend API',
    description: 'description of the task at hand',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  @ApiPropertyOptional({
    example: '{uuid}',
    description: 'User thats assigned the task',
  })
  assigneeId?: string;
}
