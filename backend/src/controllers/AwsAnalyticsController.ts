import { Request, Response } from 'express';
import type { Knex } from 'knex';
import AWS from 'aws-sdk';

export class AwsAnalyticsController {
  [x: string]: any;
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  /**
   * Configura o SDK da AWS com as credenciais fornecidas
   */
  private configureAws(credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }): void {
    AWS.config.update({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region || 'sa-east-1'
    });
  }

  /**
   * Registra um log de uso da AWS
   */
  private async logAwsUsage(userId: string, operation: string, success: boolean, details?: any): Promise<void> {
    try {
      await this.db('aws_usage_logs').insert({
        user_id: userId,
        operation,
        success,
        details: details ? JSON.stringify(details) : null,
        created_at: new Date()
      });
    } catch (error) {
      console.error('Erro ao registrar log de uso AWS:', error);
      // Falha silenciosa para não interromper a operação principal
    }
  }

  /**
   * Testa a conexão com a AWS usando as credenciais fornecidas
   * POST /api/admin/aws/test-config
   */
  async testAwsConnection(req: Request, res: Response): Promise<void> {
    try {
      const { accessKeyId, secretAccessKey, region } = req.body;
      const userId = (req.user as any)?.id;

      if (!accessKeyId || !secretAccessKey) {
        res.status(400).json({
          success: false,
          message: 'Credenciais AWS incompletas'
        });
        return;
      }

      // Configurar AWS SDK
      this.configureAws({ accessKeyId, secretAccessKey, region });

      // Testar conexão usando AWS STS (Security Token Service)
      const sts = new AWS.STS();
      const identity = await sts.getCallerIdentity().promise();

      // Registrar sucesso
      await this.logAwsUsage(userId, 'test_connection', true, { region });

      res.json({
        success: true,
        message: 'Conexão com AWS estabelecida com sucesso',
        data: {
          accountId: identity.Account,
          arn: identity.Arn,
          userId: identity.UserId
        }
      });
    } catch (error) {
      console.error('Erro no teste de conexão AWS:', error);
      const userId = (req.user as any)?.id;
      
      // Registrar falha
      await this.logAwsUsage(userId, 'test_connection', false, { error: (error as Error).message });

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: `Falha na conexão AWS: ${error.message}`
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno ao testar conexão AWS'
      });
    }
  }

  /**
   * Obtém analytics do sistema
   * POST /api/admin/aws/system-analytics
   */
  async getSystemAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { accessKeyId, secretAccessKey, region } = req.body;
      const userId = (req.user as any)?.id;

      if (!accessKeyId || !secretAccessKey) {
        res.status(400).json({
          success: false,
          message: 'Credenciais AWS incompletas'
        });
        return;
      }

      // Configurar AWS SDK
      this.configureAws({ accessKeyId, secretAccessKey, region });

      // Em uma implementação real, aqui seriam utilizados serviços da AWS como CloudWatch
      // Para este exemplo, vamos usar dados simulados enquanto a integração real é implementada
      
      // Simulação de dados para desenvolvimento
      const analytics = {
        activeUsers: Math.floor(Math.random() * 500 + 1000),
        activeClasses: Math.floor(Math.random() * 20 + 30),
        systemLoad: Math.floor(Math.random() * 30 + 50),
        responseTime: Math.floor(Math.random() * 100 + 200),
        cpuUsage: Math.floor(Math.random() * 30 + 40),
        memoryUsage: Math.floor(Math.random() * 40 + 50),
        diskUsage: Math.floor(Math.random() * 20 + 20),
        networkUsage: Math.floor(Math.random() * 30 + 70)
      };

      // Registrar sucesso
      await this.logAwsUsage(userId, 'get_system_analytics', true);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Erro ao obter analytics do sistema:', error);
      const userId = (req.user as any)?.id;
      
      // Registrar falha
      await this.logAwsUsage(userId, 'get_system_analytics', false, { error: (error as Error).message });

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: `Falha ao obter analytics: ${error.message}`
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno ao obter analytics do sistema'
      });
    }
  }

  /**
   * Obtém informações do bucket S3
   * POST /api/admin/aws/s3-storage-info
   */
  async getS3StorageInfo(req: Request, res: Response): Promise<void> {
    try {
      const { accessKeyId, secretAccessKey, region, bucketName } = req.body;
      const userId = (req.user as any)?.id;

      if (!accessKeyId || !secretAccessKey || !bucketName) {
        res.status(400).json({
          success: false,
          message: 'Credenciais AWS ou nome do bucket incompletos'
        });
        return;
      }

      // Configurar AWS SDK
      this.configureAws({ accessKeyId, secretAccessKey, region });

      // Em uma implementação real, aqui seria usado o serviço S3 da AWS
      // Para este exemplo, vamos usar dados simulados enquanto a integração real é implementada
      
      // Simulação de dados do S3 para desenvolvimento
      const s3Info = {
        bucketSize: Math.random() * 5 + 2, // Em GB
        objectCount: Math.floor(Math.random() * 500 + 1000),
        lastModified: new Date(Date.now() - Math.random() * 86400000), // Último dia
        monthlyCost: Math.random() * 5 + 2, // Custo aproximado em USD
      };

      // Registrar sucesso
      await this.logAwsUsage(userId, 'get_s3_info', true, { bucketName });

      res.json({
        success: true,
        data: s3Info
      });
    } catch (error) {
      console.error('Erro ao obter informações do S3:', error);
      const userId = (req.user as any)?.id;
      
      // Registrar falha
      await this.logAwsUsage(userId, 'get_s3_info', false, { error: (error as Error).message });

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: `Falha ao obter informações do S3: ${error.message}`
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno ao obter informações do S3'
      });
    }
  }

  /**
   * Obtém métricas do CloudWatch
   * POST /api/admin/aws/cloudwatch-metrics
   */
  async getCloudWatchMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { accessKeyId, secretAccessKey, region } = req.body;
      const userId = (req.user as any)?.id;

      if (!accessKeyId || !secretAccessKey) {
        res.status(400).json({
          success: false,
          message: 'Credenciais AWS incompletas'
        });
        return;
      }

      // Configurar AWS SDK
      this.configureAws({ accessKeyId, secretAccessKey, region });

      // Em uma implementação real, aqui seria usado o CloudWatch da AWS
      // Para este exemplo, vamos usar dados simulados enquanto a integração real é implementada
      
      // Simulação de métricas do CloudWatch para desenvolvimento
      const metrics = [
        {
          name: 'CPUUtilization',
          value: Math.floor(Math.random() * 30 + 40),
          unit: 'Percent',
          timestamp: new Date(),
          namespace: 'AWS/EC2'
        },
        {
          name: 'MemoryUtilization',
          value: Math.floor(Math.random() * 40 + 50),
          unit: 'Percent',
          timestamp: new Date(),
          namespace: 'Custom/Portal'
        },
        {
          name: 'NetworkIn',
          value: Math.floor(Math.random() * 1000 + 2000),
          unit: 'Bytes/Second',
          timestamp: new Date(),
          namespace: 'AWS/EC2'
        },
        {
          name: 'NetworkOut',
          value: Math.floor(Math.random() * 5000 + 10000),
          unit: 'Bytes/Second',
          timestamp: new Date(),
          namespace: 'AWS/EC2'
        }
      ];

      // Registrar sucesso
      await this.logAwsUsage(userId, 'get_cloudwatch_metrics', true);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Erro ao obter métricas do CloudWatch:', error);
      const userId = (req.user as any)?.id;
      
      // Registrar falha
      await this.logAwsUsage(userId, 'get_cloudwatch_metrics', false, { error: (error as Error).message });

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: `Falha ao obter métricas do CloudWatch: ${error.message}`
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno ao obter métricas do CloudWatch'
      });
    }
  }

  /**
   * Obtém status das instâncias EC2
   * POST /api/admin/aws/instance-status
   */
  async getInstanceStatus(req: Request, res: Response): Promise<void> {
    try {
      const { accessKeyId, secretAccessKey, region } = req.body;
      const userId = (req.user as any)?.id;

      if (!accessKeyId || !secretAccessKey) {
        res.status(400).json({
          success: false,
          message: 'Credenciais AWS incompletas'
        });
        return;
      }

      // Configurar AWS SDK
      this.configureAws({ accessKeyId, secretAccessKey, region });

      // Em uma implementação real, aqui seria usado o EC2 da AWS
      // Para este exemplo, vamos usar dados simulados enquanto a integração real é implementada
      
      // Simulação de status de instâncias EC2 para desenvolvimento
      const instances = [
        {
          instanceId: 'i-0123456789abcdef0',
          state: 'running',
          type: 't2.micro',
          launchTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
          publicIp: '18.228.123.45',
          zone: `${region}a`
        },
        {
          instanceId: 'i-0123456789abcdef1',
          state: 'running',
          type: 't2.small',
          launchTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 dias atrás
          publicIp: '18.228.123.46',
          zone: `${region}b`
        }
      ];

      // Registrar sucesso
      await this.logAwsUsage(userId, 'get_instance_status', true);

      res.json({
        success: true,
        data: instances
      });
    } catch (error) {
      console.error('Erro ao obter status das instâncias:', error);
      const userId = (req.user as any)?.id;
      
      // Registrar falha
      await this.logAwsUsage(userId, 'get_instance_status', false, { error: (error as Error).message });

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: `Falha ao obter status das instâncias: ${error.message}`
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno ao obter status das instâncias'
      });
    }
  }
} 