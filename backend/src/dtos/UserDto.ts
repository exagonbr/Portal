export class CreateUserDto {
  version?: string = "";
  username?: string = "";
  email?: string = "";
  passwordHash?: string = "";
  firstName?: string = "";
  lastName?: string = "";
  isActive?: string = "";
  lastLogin?: string = "";
  roleId?: string = "";
}

export class UpdateUserDto {
  version?: string = "";
  username?: string = "";
  email?: string = "";
  passwordHash?: string = "";
  firstName?: string = "";
  lastName?: string = "";
  isActive?: string = "";
  lastLogin?: string = "";
  roleId?: string = "";
}

export class UserResponseDto {
  id: string = "";
  version: string = "";
  username: string = "";
  email: string = "";
  passwordHash: string = "";
  firstName: string = "";
  lastName: string = "";
  isActive: string = "";
  createdAt: string = "";
  updatedAt: string = "";
  lastLogin: string = "";
  roleId: string = "";
}