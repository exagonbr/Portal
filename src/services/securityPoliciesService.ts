import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api-client' from './base-api-service';

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
    const response = await apiClient.post<any>(`${this.basePath}?page=${page}&limit=${limit}`, policy);
    return response.data;
  }

  async validatePassword(password: string): Promise<{ isValid: boolean; errors: string[] }> {
    const response = await apiClient.post<any>(`${this.basePath}/validate-password`, { password });
    return response.data;
  }

  async applyPolicy(policyId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.basePath}/${policyId}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao aplicar política de segurança');
    }

    return response.json();
  }

  async resetToDefaults(): Promise<SecurityPolicy> {
    const response = await fetch(`${this.basePath}/reset-defaults`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao resetar para padrões');
    }

    return response.json();
  }

  async exportPolicy(policyId: string): Promise<Blob> {
    const response = await fetch(`${this.basePath}/${policyId}/export`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
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
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
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

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar log de auditoria');
    }

    return response.json();
  }
}

export const securityPoliciesService = new SecurityPoliciesService(); 