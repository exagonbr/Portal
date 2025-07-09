import { CrudService } from './crudService';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

class UserService extends CrudService<User> {
  constructor() {
    super('/users');
  }

  async changeStatus(id: number, status: 'active' | 'inactive') {
    const response = await this.update(id, { status });
    return response;
  }

  async changeRole(id: number, role: string) {
    const response = await this.update(id, { role });
    return response;
  }
}

export const userService = new UserService();