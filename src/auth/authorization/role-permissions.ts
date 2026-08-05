import { Permission } from './permissions.enum';
import { Roles } from './roles.enum';

export const RolePermissions: Record<Roles, Permission[]> = {
  [Roles.OWNER]: Object.values(Permission),

  [Roles.ADMIN]: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,

    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,

    Permission.MEMBER_INVITE,
    Permission.MEMBER_REMOVE,
  ],

  [Roles.MEMBER]: [Permission.TASK_CREATE, Permission.TASK_UPDATE],
};
