import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from './permissions.enum';
import { Permissions } from './permissions.decorator';
import { Membership } from 'generated/prisma/client';
import { RolePermissions } from './role-permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      Permissions,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    // Extract membership already added by previous guard

    const { membership }: { membership: Membership } = context
      .switchToHttp()
      .getRequest();

    const userRole = membership.role;

    const hasPermissions = requiredPermissions.every((permission) =>
      RolePermissions[userRole].includes(permission),
    );

    return hasPermissions;
  }
}
