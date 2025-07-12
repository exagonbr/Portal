export interface AwsSettings {
  id: number;
  access_key_id: string;
  secret_access_key: string;
  region: string;
  s3_bucket_name?: string;
  cloudwatch_namespace: string;
  update_interval: number;
  enable_real_time_updates: boolean;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AwsConnectionLog {
  id: string;
  aws_settings_id: string;
  user_id?: string;
  region: string;
  service: string;
  success: boolean;
  message?: string;
  error_details?: string;
  response_time_ms?: number;
  ip_address?: string;
  user_agent?: string;
  request_metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAwsSettingsDto {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  s3_bucket_name?: string;
  cloudwatch_namespace?: string;
  update_interval?: number;
  enable_real_time_updates?: boolean;
  is_active?: boolean;
}

export interface UpdateAwsSettingsDto {
  access_key_id?: string;
  secret_access_key?: string;
  region?: string;
  s3_bucket_name?: string;
  cloudwatch_namespace?: string;
  update_interval?: number;
  enable_real_time_updates?: boolean;
  is_active?: boolean;
}

export interface CreateAwsConnectionLogDto {
  aws_settings_id: string;
  user_id?: string;
  region: string;
  service: string;
  success: boolean;
  message?: string;
  error_details?: string;
  response_time_ms?: number;
  ip_address?: string;
  user_agent?: string;
  request_metadata?: Record<string, any>;
}

export interface AwsConnectionTestResult {
  success: boolean;
  message: string;
  response_time_ms: number;
  error_details?: string;
}

export interface AwsConnectionLogStats {
  total_connections: number;
  successful_connections: number;
  failed_connections: number;
  success_rate: number;
  average_response_time: number;
  last_connection: Date | null;
  last_successful_connection: Date | null;
  services_used: string[];
} 