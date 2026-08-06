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
import type { Organization, User } from 'generated/prisma/client';
import { ValidateDTO } from 'src/common/pipe/validation.pipe';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status';
import { Permission } from 'src/auth/authorization/permissions.enum';
import { PermissionGuard } from 'src/auth/authorization/permissions.guard';
import { Permissions } from 'src/auth/authorization/permissions.decorator';
import { CurrentUser } from 'src/auth/auth.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, OrganizationMemberGuard, PermissionGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':taskId')
  getTask(@CurrentOrg() org: Organization, @Param('taskId') taskId: string) {
    return this.tasksService.getTaskById(org, taskId);
  }

  @Patch(':taskId')
  @Permissions([Permission.TASK_UPDATE])
  updateTask(
    @CurrentOrg() org: Organization,
    @Param('taskId') taskId: string,
    @Body(new ValidateDTO()) dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(org, taskId, dto);
  }

  @Delete(':taskId')
  @Permissions([Permission.TASK_DELETE])
  deleteTask(@CurrentOrg() org: Organization, @Param('taskId') taskId: string) {
    return this.tasksService.deleteTask(org, taskId);
  }

  @Patch(':taskId/status')
  @Permissions([Permission.TASK_UPDATE])
  updateTaskStatus(
    @CurrentOrg() org: Organization,
    @CurrentUser() user: User,
    @Param('taskId') taskId: string,
    @Body(new ValidateDTO()) dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(org, taskId, dto, user);
  }
}
