import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/auth.decorator';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { CurrentOrg } from 'src/organizations/org.decorator';
import { OrganizationMemberGuard } from 'src/organizations/org.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import type { Organization, User } from 'generated/prisma/client';
import { ProjectsService } from './projects.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permissions } from 'src/auth/authorization/permissions.decorator';
import { Permission } from 'src/auth/authorization/permissions.enum';
import { PermissionGuard } from 'src/auth/authorization/permissions.guard';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('projects')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-org-id',
  description: 'Active organization ID',
  required: true,
})
@UseGuards(JwtAuthGuard, OrganizationMemberGuard, PermissionGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a project',
    description: 'Creates a new project inside the current organization.',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission.',
  })
  @Permissions([Permission.PROJECT_CREATE])
  newProject(
    @CurrentUser() user: User,
    @CurrentOrg() org: Organization,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.createProject(user, org, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Returns all projects belonging to the current organization',
  })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully.' })
  @ApiResponse({
    status: 403,
    description: 'User is not a member of the organization.',
  })
  getProjects(
    @CurrentOrg() org: Organization,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.projectService.getAllProjects(org, paginationQuery);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a project by ID',
    description:
      'Returns a single project belonging to the current organization.',
  })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User is not a member of the organization.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getProjectsById(@CurrentOrg() org: Organization, @Param('id') id: string) {
    return this.projectService.getProjectById(org, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a project',
    description:
      'Updates an existing project belonging to the current organization.',
  })
  @ApiResponse({ status: 200, description: 'Project updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid project data.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to update the project.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @Permissions([Permission.PROJECT_UPDATE])
  updateProject(
    @CurrentOrg() org: Organization,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.updateProjectById(org, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Deletes an existing project belonging to the current organization.',
  })
  @ApiResponse({ status: 200, description: 'Project deleted successfully.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to delete the project.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @Permissions([Permission.PROJECT_DELETE])
  deleteProject(@CurrentOrg() org: Organization, @Param('id') id: string) {
    return this.projectService.deleteProjectById(org, id);
  }

  // Tasks Related path
  @Post(':id/tasks')
  @Permissions([Permission.TASK_CREATE])
  @ApiOperation({
    summary: 'Create a task',
    description: 'Creates a new task inside the specified project.',
  })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid task data.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to create a task.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  newTask(
    @CurrentOrg() org: Organization,
    @Param('id') id: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.projectService.createNewTask(org, id, dto);
  }

  @Get(':id/tasks')
  @ApiOperation({
    summary: 'Get tasks for a project',
    description:
      'Returns all tasks belonging to the specified project in the current organization.',
  })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description: 'User is not a member of the organization.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getTasksByProjectId(
    @CurrentOrg() org: Organization,
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.projectService.getTasksByProject(id, org, paginationQuery);
  }
}
