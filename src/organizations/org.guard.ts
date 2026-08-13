import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/auth.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrganizationRequest } from './organizations.interface';
import { Organization, User } from 'generated/prisma/client';

@Injectable()
export class OrganizationMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OrganizationRequest>();
    const user = request.user;

    const orgId = this.checkOrgId(request);

    const org = await this.orgExist(orgId);

    const membership = await this.verifyMembership(orgId, user);

    if (!membership) {
      throw new ForbiddenException('Not part of organization');
    }

    request.organization = org;
    request.membership = membership;

    return true;
  }

  private checkOrgId(request: AuthenticatedRequest): string {
    const orgId: unknown = request.headers['x-org-id'];

    if (typeof orgId !== 'string' || orgId.trim() === '') {
      throw new BadRequestException(
        'x-org-id must be present and must not be empty',
      );
    }
    return orgId;
  }

  private async verifyMembership(orgId: string, user: User) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { organizationId: orgId, userId: user.id },
      },
    });
    return membership;
  }

  private async orgExist(orgId: string): Promise<Organization> {
    const org = await this.prisma.organization.findUnique({
      where: {
        id: orgId,
      },
    });
    if (!org) {
      throw new BadRequestException('Organization id provided is not valid');
    }
    return org;
  }
}
