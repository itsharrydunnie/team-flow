import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from 'src/auth/auth.gaurd';
import { CurrentUser } from 'src/auth/auth.decorator';
import type { User } from 'generated/prisma/client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Permission } from 'src/auth/authorization/permissions.enum';
import { Permissions } from 'src/auth/authorization/permissions.decorator';
import { OrganizationMemberGuard } from './org.guard';
import { InviteMemberDto, UpdateRoleDto } from './dto/invite-member.dto';
import { PermissionGuard } from 'src/auth/authorization/permissions.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto, user);
  }

  @Get()
  getUserOrgs(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.organizationsService.getUserOrgs(user, paginationDto);
  }

  @Get(':id')
  getOneOrg(@CurrentUser() user: User, @Param('id') id: string) {
    return this.organizationsService.getOrgById(id);
  }

  @Patch(':id')
  @UseGuards(OrganizationMemberGuard, PermissionGuard)
  @Permissions([Permission.ORGANIZATION_UPDATE])
  updateOrg(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @UseGuards(OrganizationMemberGuard, PermissionGuard)
  @Permissions([Permission.ORGANIZATION_DELETE])
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  // Membership Management
  @Post(':id/members')
  @UseGuards(OrganizationMemberGuard, PermissionGuard)
  @Permissions([Permission.MEMBER_INVITE])
  inviteToOrg(@Param('id') id: string, @Body() inviteDto: InviteMemberDto) {
    return this.organizationsService.addMember(id, inviteDto);
  }

  @Patch(':id/members/:userId/role')
  @UseGuards(OrganizationMemberGuard, PermissionGuard)
  @Permissions([Permission.MEMBER_UPDATE_ROLE])
  updateRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() roleDto: UpdateRoleDto,
  ) {
    return this.organizationsService.updateMemberRole(id, userId, roleDto);
  }
}
