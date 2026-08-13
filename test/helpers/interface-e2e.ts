import { Organization, Project, Task, User } from 'generated/prisma/client';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface OrganizationResponse extends Organization {}

export interface ProjectResponse extends Project {}

export interface MeResponse extends User {}

export interface TaskResponse extends Task {}
