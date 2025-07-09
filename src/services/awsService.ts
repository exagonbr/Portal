// src/services/awsService.ts
import { SystemUsageData } from '../types/analytics';
import { apiGet } from './apiService';
import { UnifiedAuthService } from './unifiedAuthService';
import { AuthHeaderService } from './authHeaderService';

// --- Interfaces ---

/**
 * As interfaces para os dados da AWS. Idealmente, elas estariam em um arquivo de tipos compartilhado.
 */

// Análise de Sistema (CloudWatch)
export interface SystemAnalytics {
  cpuUsage: number;
  memoryUsage: number;
  networkIn: number;
  networkOut: number;
  diskUsage: number;
}

// Armazenamento S3
export interface S3BucketInfo {
    name: string;
    creationDate: string;
    region: string;
}

export interface S3StorageInfo {
  totalSizeMb: number;
  numberOfFiles: number;
  buckets: S3BucketInfo[];
}

// Instâncias EC2
export interface Ec2Instance {
    id: string;
    name: string;
    type: string;
    state: 'pending' | 'running' | 'shutting-down' | 'terminated' | 'stopping' | 'stopped';
    region: string;
    publicIp?: string;
}

// Bancos de Dados RDS
export interface RdsInstance {
    id: string;
    engine: 'mysql' | 'postgres' | 'mariadb' | 'oracle' | 'sqlserver';
    engineVersion: string;
    instanceClass: string;
    status: string;
    endpoint: string;
    region: string;
}

// Load Balancers (ELB)
export interface LoadBalancer {
    name: string;
    dnsName: string;
    type: 'application' | 'network' | 'gateway';
    state: string;
    region: string;
}

// Zonas Hospedadas do Route 53
export interface Route53HostedZone {
    id: string;
    name: string;
    recordCount: number;
    isPrivate: boolean;
}

// Backups (AWS Backup)
export interface AwsBackupJob {
    id: string;
    resourceArn: string;
    resourceType: string;
    status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'ABORTED';
    creationDate: string;
    completionDate?: string;
}

// Snapshots (EBS)
export interface Ec2Snapshot {
    id: string;
    volumeId: string;
    volumeSizeGb: number;
    startTime: string;
    state: 'pending' | 'completed' | 'error';
    description?: string;
}

// Custos e Faturamento (Cost Explorer)
export interface AwsCostData {
    period: {
        start: string;
        end: string;
    };
    total: {
        amount: string;
        unit: string;
    };
    byService: {
        [serviceName: string]: {
            amount: string;
            unit: string;
        };
    };
}

// Status de Serviço (Health Dashboard)
export interface AwsServiceHealth {
    serviceName: string;
    serviceCode: string;
    region: string;
    status: 'OPERATIONAL' | 'PERFORMANCE_ISSUES' | 'SERVICE_DISRUPTION';
    events: {
        id: string;
        statusCode: string;
        startTime: string;
        description: string;
    }[];
}


/**
 * Uma função helper para fazer requisições fetch e tratar erros.
 */
const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const headers = await AuthHeaderService.getHeaders();

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'omit',
  });

  if (!res.ok) {
    let errorMessage = 'Ocorreu um erro ao buscar os dados da AWS.';
    let errorInfo = {};
    
    // Customizar mensagem de erro baseada no status HTTP
    switch (res.status) {
      case 401:
        errorMessage = 'Não autorizado. Verifique suas credenciais de acesso.';
        break;
      case 403:
        errorMessage = 'Acesso negado aos recursos da AWS.';
        break;
      case 404:
        errorMessage = 'Recurso AWS não encontrado.';
        break;
      case 429:
        errorMessage = 'Limite de requisições excedido. Tente novamente em alguns instantes.';
        break;
      case 500:
        errorMessage = 'Erro interno no servidor AWS.';
        break;
      case 502:
      case 503:
      case 504:
        errorMessage = 'Serviço AWS temporariamente indisponível.';
        break;
    }
    
    const error = new Error(errorMessage);
    
    try {
      const errorData = await res.json();
      errorInfo = errorData;
    } catch (e) {
      errorInfo = { message: 'Não foi possível analisar a resposta de erro.' };
    }
    
    (error as any).info = errorInfo;
    (error as any).status = res.status;
    (error as any).url = url;
    throw error;
  }
  
  return res.json();
};

/**
 * O objeto de serviço da AWS que encapsula as chamadas de API para o seu backend.
 */
const awsService = {
  // --- Análise e Monitoramento ---
  getSystemAnalytics: async (): Promise<SystemAnalytics> => {
    const data = await apiGet<SystemAnalytics>('/aws/system-analytics');
    
    // Garantir que todos os campos tenham valores padrão em caso de dados incompletos
    return {
      cpuUsage: data?.cpuUsage ?? 0,
      memoryUsage: data?.memoryUsage ?? 0,
      networkIn: data?.networkIn ?? 0,
      networkOut: data?.networkOut ?? 0,
      diskUsage: data?.diskUsage ?? 0
    };
  },
  getServiceHealth: async (region: string): Promise<AwsServiceHealth[]> => {
    return apiGet<AwsServiceHealth[]>(`/aws/health?region=${region}`);
  },

  // --- Armazenamento e Conteúdo ---
  getS3StorageInfo: async (): Promise<S3StorageInfo> => {
    return apiGet<S3StorageInfo>('/aws/s3-storage');
  },

  // --- Computação ---
  getEc2Instances: async (): Promise<Ec2Instance[]> => {
    return apiGet<Ec2Instance[]>('/aws/ec2-instances');
  },
  getLambdaFunctions: async (): Promise<any[]> => { // A interface para Lambda pode ser adicionada se necessário
    return apiGet<any[]>('/aws/lambda-functions');
  },

  // --- Banco de Dados ---
  getRdsInstances: async (): Promise<RdsInstance[]> => {
    return apiGet<RdsInstance[]>('/aws/rds-instances');
  },

  // --- Rede ---
  getLoadBalancers: async (): Promise<LoadBalancer[]> => {
    return apiGet<LoadBalancer[]>('/aws/load-balancers');
  },
  getRoute53HostedZones: async (): Promise<Route53HostedZone[]> => {
    return apiGet<Route53HostedZone[]>('/aws/route53-zones');
  },

  // --- Backup e Recuperação ---
  getAwsBackups: async (): Promise<AwsBackupJob[]> => {
    return apiGet<AwsBackupJob[]>('/aws/backups');
  },
  getEc2Snapshots: async (): Promise<Ec2Snapshot[]> => {
    return apiGet<Ec2Snapshot[]>('/aws/ec2-snapshots');
  },

  // --- Custos ---
  getBillingInfo: async (): Promise<AwsCostData> => {
    return apiGet<AwsCostData>('/aws/billing');
  },

  /**
   * Busca o histórico de uso do sistema (ex: CloudWatch) para um período.
   * @param hours - O número de horas passadas para buscar.
   */
  getSystemUsageHistory: async (hours: number): Promise<SystemUsageData> => {
    return apiGet<SystemUsageData>(`/aws/system-usage-history?hours=${hours}`);
  },

  /**
   * Busca dados sobre a distribuição de uso de recursos da AWS.
   */
  getResourceDistribution: async (): Promise<any[]> => { // O tipo pode ser mais específico
    return apiGet<any[]>('/aws/resource-distribution');
  },
};

export { awsService };