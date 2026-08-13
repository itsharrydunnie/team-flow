export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  organizationId: string;
}

export interface MeResponse {
  id: string;
  email: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assigneeId: string;
  projectId: string;
  organizationId: string;
}
