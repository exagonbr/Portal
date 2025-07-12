export class CreateRolePermissionsDto {
  roleId?: string = "";
  permissionId?: string = "";
}

export class UpdateRolePermissionsDto {
  roleId?: string = "";
  permissionId?: string = "";
}

export class RolePermissionsResponseDto {
  id: string = "";
  roleId: string = "";
  permissionId: string = "";
  createdAt: string = "";
  updatedAt: string = "";
}