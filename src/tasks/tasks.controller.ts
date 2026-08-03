import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.gaurd';
import { OrganizationMemberGuard } from 'src/organizations/org.guard';
import { TasksService } from './tasks.service';
import { CurrentOrg } from 'src/organizations/org.decorator';
import type { Organization } from 'generated/prisma/client';
import { ValidateDTO } from 'src/common/pipe/validation.pipe';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-taskStatus';

@Controller('tasks')
@UseGuards(JwtAuthGuard, OrganizationMemberGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':taskId')
  getTask(@CurrentOrg() org: Organization, @Param('taskId') taskId: string) {
    return this.tasksService.getTaskById(org, taskId);
  }

  @Patch(':taskId')
  updateTask(
    @CurrentOrg() org: Organization,
    @Param('taskId') taskId: string,
    @Body(new ValidateDTO()) dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(org, taskId, dto);
  }

  @Delete(':taskId')
  deleteTask(@CurrentOrg() org: Organization, @Param('taskId') taskId: string) {
    return this.tasksService.deleteTask(org, taskId);
  }

  @Patch(':taskId/status')
  updateTaskStatus(
    @CurrentOrg() org: Organization,
    @Param('taskId') taskId: string,
    @Body(new ValidateDTO()) dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(org, taskId, dto);
  }
}
