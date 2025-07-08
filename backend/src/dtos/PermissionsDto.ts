export class CreatePermissionsDto {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
}

export class UpdatePermissionsDto {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
}

export class PermissionsResponseDto {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}