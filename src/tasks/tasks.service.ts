import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Organization, User } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getTaskById(org: Organization, taskId: string) {
    const { id: currentOrgId } = org;
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId: currentOrgId,
      },
      include: {
        assignee: true,
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async updateTask(org: Organization, taskId: string, dto: UpdateTaskDto) {
    await this.getTaskById(org, taskId);

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: dto,
    });
  }

  async updateTaskStatus(
    org: Organization,
    taskId: string,
    dto: UpdateTaskStatusDto,
    user: User,
  ) {
    const { status } = dto;

    const task = await this.getTaskById(org, taskId);

    if (!(user.id === task.assigneeId)) {
      throw new ForbiddenException('Task not assigned to user');
    }

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: status,
      },
    });
  }

  async deleteTask(org: Organization, taskId: string) {
    await this.getTaskById(org, taskId);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
