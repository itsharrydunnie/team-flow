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
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create an organization',
    description: 'Creates a new organization for the authenticated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid organization data.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  create(@CurrentUser() user: User, @Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user organizations',
    description:
      'Returns the organizations that the authenticated user belongs to.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  getUserOrgs(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.organizationsService.getUserOrgs(user, paginationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an organization by ID',
    description: 'Returns an organization by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  getOneOrg(@CurrentUser() user: User, @Param('id') id: string) {
    return this.organizationsService.getOrgById(id);
  }

  @Patch(':id')
  @ApiHeader({
    name: 'x-org-id',
    description: 'Active organization ID',
    required: true,
  })
  @UseGuards(OrganizationMemberGuard, PermissionGuard)
  @Permissions([Permission.ORGANIZATION_UPDATE])
  @ApiOperation({
    summary: 'Update an organization',
    description:
      'Updates an organization. The authenticated user must have organization update permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid organization data.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description:
      'User is not a member of the organization or does not have permission.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  updateOrg(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiHeader({
    name: 'x-org-id',
    description: 'Active organization ID',
    required: true,
  })
  @UseGuards(OrganizationMemberGuard, PermissionGuard)
  @Permissions([Permission.ORGANIZATION_DELETE])
  @ApiOperation({
    summary: 'Delete an organization',
    description:
      'Deletes an organization. The authenticated user must have organization delete permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description:
      'User is not a member of the organization or does not have permission.',
  })
  @ApiResponse({ status: 404, description: 'Organization not found.' })
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  // Membership Management
  @Post(':id/members')
  @ApiHeader({
    name: 'x-org-id',
    description: 'Active organization ID',
    required: true,
  })
  @UseGuards(OrganizationMemberGuard, PermissionGuard)
  @Permissions([Permission.MEMBER_INVITE])
  @ApiOperation({
    summary: 'Invite a member',
    description:
      'Adds a user to the organization. The authenticated user must have member invite permission.',
  })
  @ApiResponse({ status: 201, description: 'Member invited successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid invitation data.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description:
      'User is not a member of the organization or does not have permission.',
  })
  @ApiResponse({ status: 404, description: 'Organization or user not found.' })
  inviteToOrg(@Param('id') id: string, @Body() inviteDto: InviteMemberDto) {
    return this.organizationsService.addMember(id, inviteDto);
  }

  @Patch(':id/members/:userId/role')
  @ApiHeader({
    name: 'x-org-id',
    description: 'Active organization ID',
    required: true,
  })
  @UseGuards(OrganizationMemberGuard, PermissionGuard)
  @Permissions([Permission.MEMBER_UPDATE_ROLE])
  @ApiOperation({
    summary: 'Update member role',
    description:
      'Updates the role of a member in the organization. The authenticated user must have permission to update member roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Member role updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid role data.' })
  @ApiResponse({ status: 401, description: 'User is not authenticated.' })
  @ApiResponse({
    status: 403,
    description:
      'User is not a member of the organization or does not have permission.',
  })
  @ApiResponse({ status: 404, description: 'Organization or user not found.' })
  updateRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() roleDto: UpdateRoleDto,
  ) {
    return this.organizationsService.updateMemberRole(id, userId, roleDto);
  }
}
