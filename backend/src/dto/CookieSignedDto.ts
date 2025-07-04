import { BaseEntity } from '../types/common';

export interface CreateCookieSignedDto {
  cookie?: string;
}

export interface UpdateCookieSignedDto {
  cookie?: string;
}

export interface CookieSignedResponseDto extends BaseEntity {
  id: string;
  cookie?: string;
}