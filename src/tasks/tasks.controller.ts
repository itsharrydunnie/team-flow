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
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status';
import { Permission } from 'src/auth/authorization/permissions.enum';
import { PermissionGuard } from 'src/auth/authorization/permissions.guard';
import { Permissions } from 'src/auth/authorization/permissions.decorator';
import { CurrentUser } from 'src/auth/auth.decorator';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('tasks')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-org-id',
  description: 'Active organization ID',
  required: true,
})
@UseGuards(JwtAuthGuard, OrganizationMemberGuard, PermissionGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':taskId')
  @ApiOperation({
    summary: 'Get a task by ID',
    description: 'Returns a single task belonging to the current organization.',
  })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User is not a member of the organization.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  getTask(@CurrentOrg() org: Organization, @Param('taskId') taskId: string) {
    return this.tasksService.getTaskById(org, taskId);
  }

  @Patch(':taskId')
  @Permissions([Permission.TASK_UPDATE])
  @ApiOperation({
    summary: 'Update a task',
    description:
      'Updates an existing task belonging to the current organization.',
  })
  @ApiResponse({ status: 200, description: 'Task updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid task data.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to update the task.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  updateTask(
    @CurrentOrg() org: Organization,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(org, taskId, dto);
  }

  @Delete(':taskId')
  @Permissions([Permission.TASK_DELETE])
  @ApiOperation({
    summary: 'Delete a task',
    description:
      'Deletes an existing task belonging to the current organization.',
  })
  @ApiResponse({ status: 200, description: 'Task deleted successfully.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to delete the task.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  deleteTask(@CurrentOrg() org: Organization, @Param('taskId') taskId: string) {
    return this.tasksService.deleteTask(org, taskId);
  }

  @Patch(':taskId/status')
  @Permissions([Permission.TASK_UPDATE])
  @ApiOperation({
    summary: 'Update task status',
    description:
      'Updates the status of a task belonging to the current organization.',
  })
  @ApiResponse({
    status: 200,
    description: 'Task status updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid task status.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to update the task.',
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  updateTaskStatus(
    @CurrentOrg() org: Organization,
    @CurrentUser() user: User,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatus(org, taskId, dto, user);
  }
}
