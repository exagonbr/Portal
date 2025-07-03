import { Users } from '../entities/Users';
import { Role } from '../entities/Role';

export interface UserWithRelations extends Users {
  role?: Role;
} 