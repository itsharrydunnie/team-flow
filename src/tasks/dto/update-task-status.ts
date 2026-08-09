import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TaskStatus } from 'generated/prisma/enums';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  @ApiProperty({
    example: 'TODO',
    description: 'Status of a created task. Defaullt is TODO',
  })
  status!: TaskStatus;
}
