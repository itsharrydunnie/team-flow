import { SetMetadata } from '@nestjs/common';
import { Permission } from './permissions.enum';
import { Reflector } from '@nestjs/core';

export const Permissions = Reflector.createDecorator<Permission[]>();

// Variadic Syntax
/**
 * const PermissionsMetadata = Reflector.createDecorator<Permission[]>();

export const Permissions = (...permissions: Permission[]) =>
  PermissionsMetadata(permissions);


@Permissions(Permission.READ, Permission.WRITE)
 */
