import { ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import type { User } from 'generated/prisma/client';
import { Role } from './org.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { InviteMemberDto, UpdateRoleDto } from './dto/invite-member.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
  ) {}

  async create(dto: CreateOrganizationDto, user: User) {
    const { name } = dto;
    const { id: userId } = user;

    let slug = slugify(dto.name, { lower: true, strict: true });

    const count = await this.prisma.organization.count({
      where: { slug },
    });

    if (count > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    const newOrg = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          slug,
        },
      });

      const membership = await tx.membership.create({
        data: {
          organizationId: org.id,
          userId,
          role: Role.OWNER,
        },
      });

      return org;
    });

    return {
      organization: newOrg,
    };
  }

  async getUserOrgs(user: User, paginationDto: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const skip = (page - 1) * limit;

    const membership = await this.prisma.membership.findMany({
      where: {
        userId: user.id,
      },
      include: {
        organization: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return membership;
  }

  async getOrgById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
      },
      include: {
        projects: true,
        memberships: {
          include: {
            user: true,
          },
        },
        tasks: true,
      },
    });
    return organization;
  }

  async update(id: string, updateOrgDto: UpdateOrganizationDto) {
    await this.getOrgById(id);

    const updatedOrg = await this.prisma.organization.update({
      where: {
        id,
      },
      data: updateOrgDto,
    });
    return updatedOrg;
  }

  async remove(id: string) {
    await this.getOrgById(id);

    await this.prisma.organization.delete({
      where: {
        id,
      },
    });

    return 'sucessfully deleted';
  }

  // Membership Management
  async addMember(orgId: string, dto: InviteMemberDto) {
    const { email, role } = dto;

    const user = await this.userService.findUserByEmail(email);

    const existMembership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          organizationId: orgId,
          userId: user.id,
        },
      },
    });

    if (existMembership) {
      throw new ConflictException('User already a member');
    }

    const newMembership = await this.prisma.membership.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        role: Role[role],
      },
    });

    return newMembership;
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    newRole: UpdateRoleDto,
  ) {
    const { role } = newRole;

    await this.userService.findUserById(userId);

    const membership = await this.prisma.membership.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      data: {
        role: Role[role],
      },
    });

    return membership;
  }
}
