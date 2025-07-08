export class CreateAuthorDto {
  version?: string;
  description?: string;
  email?: string;
  isActive?: string;
  name?: string;
}

export class UpdateAuthorDto {
  version?: string;
  description?: string;
  email?: string;
  isActive?: string;
  name?: string;
}

export class AuthorResponseDto {
  id: string;
  version: string;
  description: string;
  email: string;
  isActive: string;
  name: string;
}