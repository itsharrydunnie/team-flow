import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const orgId = this.checkOrgId(request);

    const { status, org } = await this.orgExist(orgId);
    if (!status) {
      throw new BadRequestException('Organization id provided is not valid');
    }

    const membership = await this.verifyMembership(orgId, user);

    if (!membership) {
      throw new ForbiddenException('Not part of organization');
    }

    request.organization = org;
    request.membership = membership;

    return true;
  }

  private checkOrgId(request: Request): string {
    if (!Object.hasOwn(request.headers, 'x-org-id')) {
      throw new BadRequestException('x-org-id must be present in header');
    }

    const orgId = request.headers['x-org-id'];
    if (!orgId) {
      throw new BadRequestException('Value for x-org-id must be present');
    }
    return orgId;
  }

  private async verifyMembership(orgId: string, user) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: { organizationId: orgId, userId: user.id },
      },
    });
    return membership;
  }

  private async orgExist(
    orgId: string,
  ): Promise<{ status: boolean; org: any }> {
    const org = await this.prisma.organization.findUnique({
      where: {
        id: orgId,
      },
    });
    if (!org) {
      return { status: false, org: org };
    }
    return { status: true, org };
  }
}
