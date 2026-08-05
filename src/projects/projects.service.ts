import { Injectable, NotFoundException } from '@nestjs/common';
import { Organization, User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(user: User, org: Organization, dto: CreateProjectDto) {
    const { id: userId } = user;
    const { id: currentOrgId } = org;
    const { name, description } = dto;

    const newProject = await this.prisma.project.create({
      data: {
        name,
        description,
        organizationId: currentOrgId,
        ownerId: userId,
      },
    });

    return newProject;
  }

  async getAllProjects(org: Organization, paginationQuery: PaginationQueryDto) {
    const { id: currentOrgId } = org;
    const { page = 1, limit = 10 } = paginationQuery;

    // calculate how many items to skip
    const skip = (page - 1) * limit;

    const allProjects = await this.prisma.project.findMany({
      where: {
        organizationId: currentOrgId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return allProjects;
  }

  async getProjectById(org: Organization, id: string) {
    const { id: currentOrgId } = org;

    const project = await this.prisma.project.findFirst({
      where: {
        id,
        organizationId: currentOrgId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async updateProjectById(
    org: Organization,
    id: string,
    dto: UpdateProjectDto,
  ) {
    const { id: currentOrgId } = org;
    const { name, description } = dto;

    await this.getProjectById(org, id);

    const updatedProject = await this.prisma.project.update({
      where: {
        id,
      },
      data: {
        name,
        description,
      },
    });

    return updatedProject;
  }

  async deleteProjectById(org: Organization, id: string) {
    const { id: currentOrgId } = org;

    await this.getProjectById(org, id);

    const deletedProject = await this.prisma.project.delete({
      where: {
        id,
      },
    });

    return deletedProject;
  }

  async createNewTask(
    org: Organization,
    projectId: string,
    dto: CreateTaskDto,
  ) {
    const { title, assigneeId } = dto;
    const { id: currentOrgId } = org;

    await this.getProjectById(org, projectId);

    const newTask = await this.prisma.task.create({
      data: {
        title,
        assigneeId,
        projectId,
        organizationId: currentOrgId,
      },
    });
    return newTask;
  }

  async getTasksByProject(
    projectId: string,
    org: Organization,
    paginationQuery: PaginationQueryDto,
  ) {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const task = await this.prisma.task.findMany({
      where: {
        projectId,
        organizationId: org.id,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
  }
}
