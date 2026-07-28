import { UUID } from 'crypto';

export interface User {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
}
