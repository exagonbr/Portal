export class CreateRolesDto {
  name?: string = "";
  description?: string = "";
  isActive?: string = "";
  version?: string = "";
}

export class UpdateRolesDto {
  name?: string = "";
  description?: string = "";
  isActive?: string = "";
  version?: string = "";
}

export class RolesResponseDto {
  id: string = "";
  name: string = "";
  description: string = "";
  isActive: string = "";
  createdAt: string = "";
  updatedAt: string = "";
  version: string = "";
}