import { BaseApiService } from './base-api-service';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';
import { UnifiedAuthService } from './unifiedAuthService';
import { AuthHeaderService } from './authHeaderService';

export interface SecurityPolicy {
  id: string;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordExpiryDays: number;
  passwordPreventReuse: number;
  accountMaxLoginAttempts: number;
  accountLockoutDurationMinutes: number;
  accountSessionTimeoutMinutes: number;
  accountRequireMfa: boolean;
  accountInactivityLockoutDays: number;
  dataRetentionMonths: number;
  dataEncryptSensitiveData: boolean;
  dataAnonymizeDeletedUsers: boolean;
  dataEnableAuditLogging: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSecurityPolicyDto {
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSpecialChars?: boolean;
  passwordExpiryDays?: number;
  passwordPreventReuse?: number;
  accountMaxLoginAttempts?: number;
  accountLockoutDurationMinutes?: number;
  accountSessionTimeoutMinutes?: number;
  accountRequireMfa?: boolean;
  accountInactivityLockoutDays?: number;
  dataRetentionMonths?: number;
  dataEncryptSensitiveData?: boolean;
  dataAnonymizeDeletedUsers?: boolean;
  dataEnableAuditLogging?: boolean;
  createdBy?: string;
}

export interface UpdateSecurityPolicyDto {
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSpecialChars?: boolean;
  passwordExpiryDays?: number;
  passwordPreventReuse?: number;
  accountMaxLoginAttempts?: number;
  accountLockoutDurationMinutes?: number;
  accountSessionTimeoutMinutes?: number;
  accountRequireMfa?: boolean;
  accountInactivityLockoutDays?: number;
  dataRetentionMonths?: number;
  dataEncryptSensitiveData?: boolean;
  dataAnonymizeDeletedUsers?: boolean;
  dataEnableAuditLogging?: boolean;
  updatedBy?: string;
}

export interface SecurityPoliciesResponse {
  data: SecurityPolicy[];
  total: number;
}

export interface SecurityPolicyValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class SecurityPoliciesService extends BaseApiService<SecurityPolicy> {
  constructor() {
    super('/api/security-policies');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<SecurityPoliciesResponse> {
    return apiGet<SecurityPoliciesResponse>(`${this.basePath}?page=${page}&limit=${limit}`);
  }

  async validatePassword(password: string): Promise<{ isValid: boolean; errors: string[] }> {
    return apiPost<{ isValid: boolean; errors: string[] }>(`${this.basePath}/validate-password`, { password });
  }

  async applyPolicy(policyId: string): Promise<{ success: boolean; message: string }> {
    return apiPost<{ success: boolean; message: string }>(`${this.basePath}/${policyId}/apply`, {});
  }

  async resetToDefaults(): Promise<SecurityPolicy> {
    return apiPost<SecurityPolicy>(`${this.basePath}/reset-defaults`, {});
  }

  async exportPolicy(policyId: string): Promise<Blob> {
    const response = await fetch(`${this.basePath}/${policyId}/export`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao exportar política');
    }

    return response.blob();
  }

  async importPolicy(file: File): Promise<{ success: boolean; policy: SecurityPolicy }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.basePath}/import`, {
      method: 'POST',
      headers: await this.getHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha ao importar política');
    }

    return response.json();
  }

  async getAuditLog(policyId?: string, limit: number = 50): Promise<any[]> {
    let url = `${this.basePath}/audit-log?limit=${limit}`;
    if (policyId) {
      url += `&policyId=${policyId}`;
    }

    return apiGet<any[]>(url);
  }

  private async getHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    return AuthHeaderService.getHeaders(includeContentType);
  }
}

export const securityPoliciesService = new SecurityPoliciesService(); 