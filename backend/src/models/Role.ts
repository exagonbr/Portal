export interface Role {
  id: number;
  version?: number;
  authority?: string;
  displayName?: string;
}

export interface CreateRoleData {
  authority: string;
  displayName: string;
}

export interface UpdateRoleData {
  authority?: string;
  displayName?: string;
}