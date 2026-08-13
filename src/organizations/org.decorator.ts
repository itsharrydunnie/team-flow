import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OrganizationRequest } from './organizations.interface';

export const CurrentOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<OrganizationRequest>();

    return request.organization;
  },
);
