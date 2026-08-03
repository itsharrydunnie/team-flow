import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma/prisma.service';
import type { User } from 'generated/prisma/client';
import { Role } from './org.enum';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateOrganizationDto, user: User) {
    const { name } = dto;
    const { id: userId } = user;

    // Generate slug
    let slug = slugify(dto.name, { lower: true, strict: true });

    // check if the slug already exists
    const count = await this.prisma.organization.count({
      where: { slug },
    });

    if (count > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    // begin transaction
    const newOrg = await this.prisma.$transaction(async (tx) => {
      // create org
      const org = await tx.organization.create({
        data: {
          name,
          slug,
        },
      });

      // create membership with ord id, user id, user role
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

  findAll() {
    return `This action returns all organizations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organization`;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
