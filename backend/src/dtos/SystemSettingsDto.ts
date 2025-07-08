export class CreateSystemSettingsDto {
  key?: string;
  value?: string;
  type?: string;
  description?: string;
  category?: string;
  isPublic?: string;
  isEncrypted?: string;
}

export class UpdateSystemSettingsDto {
  key?: string;
  value?: string;
  type?: string;
  description?: string;
  category?: string;
  isPublic?: string;
  isEncrypted?: string;
}

export class SystemSettingsResponseDto {
  id: string;
  key: string;
  value: string;
  type: string;
  description: string;
  category: string;
  isPublic: string;
  isEncrypted: string;
  createdAt: string;
  updatedAt: string;
}