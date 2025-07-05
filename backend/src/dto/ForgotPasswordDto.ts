import { BaseEntity } from '../types/common';

export interface CreateForgotPasswordDto {
  email?: string;
}

export interface UpdateForgotPasswordDto {
  email?: string;
}

export interface ForgotPasswordResponseDto extends BaseEntity {
  id: string;
  version?: number;
  email?: string;
}