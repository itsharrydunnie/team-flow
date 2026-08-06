import { Permission } from './permissions.enum';
import { Reflector } from '@nestjs/core';

export const Permissions = Reflector.createDecorator<Permission[]>();
