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
import { ValidateDTO } from 'src/common/pipe/validation.pipe';
import { CurrentOrg } from 'src/organizations/org.decorator';
import { OrganizationMemberGuard } from 'src/organizations/org.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import type { Organization, User } from 'generated/prisma/client';
import { ProjectsService } from './projects.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Controller('projects')
// @UseGuards(JwtAuthGuard)
// @UseGuards(OrgGuard) // this way of using guard gave me an error, the request object didn't match
@UseGuards(JwtAuthGuard, OrganizationMemberGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Post()
  newProject(
    @CurrentUser() user: User,
    @CurrentOrg() org: Organization,
    @Body(new ValidateDTO()) dto: CreateProjectDto,
  ) {
    return this.projectService.createProject(user, org, dto);
  }

  @Get()
  getProjects(
    @CurrentOrg() org: Organization,
    @Query(new ValidateDTO()) paginationQuery: PaginationQueryDto,
  ) {
    return this.projectService.getAllProjects(org, paginationQuery);
  }

  @Get(':id')
  getProjectsById(@CurrentOrg() org: Organization, @Param('id') id: string) {
    return this.projectService.getProjectById(org, id);
  }

  @Patch(':id')
  updateProject(
    @CurrentOrg() org: Organization,
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body(new ValidateDTO()) dto: UpdateProjectDto,
  ) {
    return this.projectService.updateProjectById(org, id, dto);
  }

  @Delete(':id')
  deleteProject(
    @CurrentOrg() org: Organization,
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.projectService.deleteProjectById(org, id);
  }

  // Tasks Related path
  @Post(':id/tasks')
  newTask(
    @CurrentOrg() org: Organization,
    @Param('id') id: string,
    @Body(new ValidateDTO()) dto: CreateTaskDto,
  ) {
    return this.projectService.createNewTask(org, id, dto);
  }

  @Get(':id/tasks')
  getTasksByProjectId(
    @CurrentOrg() org: Organization,
    @Param('id') id: string,
    @Query(new ValidateDTO()) paginationQuery: PaginationQueryDto,
  ) {
    return this.projectService.getTasksByProject(id, org, paginationQuery);
  }
}
