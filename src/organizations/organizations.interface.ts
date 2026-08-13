import { Membership, Organization } from 'generated/prisma/client';
import { AuthenticatedRequest } from 'src/auth/auth.interface';

export interface OrganizationRequest extends AuthenticatedRequest {
  organization: Organization;
  membership: Membership;
}
