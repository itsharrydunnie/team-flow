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
import { JwtAuthGuard } from 'src/auth/auth.gaurd';
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

@Controller('projects')
@UseGuards(JwtAuthGuard, OrganizationMemberGuard, PermissionGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Post()
  @Permissions([Permission.PROJECT_CREATE])
  newProject(
    @CurrentUser() user: User,
    @CurrentOrg() org: Organization,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectService.createProject(user, org, dto);
  }

  @Get()
  getProjects(
    @CurrentOrg() org: Organization,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.projectService.getAllProjects(org, paginationQuery);
  }

  @Get(':id')
  getProjectsById(@CurrentOrg() org: Organization, @Param('id') id: string) {
    return this.projectService.getProjectById(org, id);
  }

  @Patch(':id')
  @Permissions([Permission.PROJECT_UPDATE])
  updateProject(
    @CurrentOrg() org: Organization,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.updateProjectById(org, id, dto);
  }

  @Delete(':id')
  @Permissions([Permission.PROJECT_DELETE])
  deleteProject(@CurrentOrg() org: Organization, @Param('id') id: string) {
    return this.projectService.deleteProjectById(org, id);
  }

  // Tasks Related path
  @Post(':id/tasks')
  @Permissions([Permission.TASK_CREATE])
  newTask(
    @CurrentOrg() org: Organization,
    @Param('id') id: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.projectService.createNewTask(org, id, dto);
  }

  @Get(':id/tasks')
  getTasksByProjectId(
    @CurrentOrg() org: Organization,
    @Param('id') id: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.projectService.getTasksByProject(id, org, paginationQuery);
  }
}
