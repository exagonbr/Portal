import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { QueueNames, addBackupJob, JobTypes } from '../config/queue';

// Interface para o resumo de estatísticas de backups
interface BackupSummaryStats {
  lastBackupDate?: string;
  lastBackupStatus?: 'success' | 'failed' | string;
  nextBackupDate?: string;
  nextBackupTime?: string;
  usedSpace?: string;
  totalSpace?: string;
}

// Interface para um backup
interface Backup {
  id: string;
  name: string;
  type: 'Completo' | 'Incremental' | 'Diferencial' | string; 
  date: string;
  size: string;
  status: 'success' | 'failed' | 'in_progress' | string;
  duration?: string;
}

export class BackupService {
  private backupDir: string;
  private mockMode: boolean = true; // Modo de simulação temporário

  constructor() {
    // Diretório onde os backups serão armazenados
    this.backupDir = path.join(process.cwd(), 'backups');
    
    // Criar diretório se não existir
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Lista todos os backups disponíveis
   */
  public async listBackups(): Promise<{ backups: Backup[], summary: BackupSummaryStats }> {
    try {
      if (this.mockMode) {
        // Modo de simulação para desenvolvimento
        return this.getMockBackups();
      }
      
      // Implementação real: leitura dos backups do diretório/banco
      const backups: Backup[] = [];
      
      // Verificar arquivos no diretório de backups
      const files = fs.readdirSync(this.backupDir);
      
      // Processar os arquivos de backup
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && file.endsWith('.zip')) {
          const fileInfo = path.parse(file);
          // Exemplo: backup_20230601_120000_completo.zip
          const nameParts = fileInfo.name.split('_');
          
          if (nameParts.length >= 4) {
            const dateStr = nameParts[1];
            const timeStr = nameParts[2];
            const type = nameParts[3].charAt(0).toUpperCase() + nameParts[3].slice(1);
            
            backups.push({
              id: fileInfo.name,
              name: `Backup ${dateStr} ${timeStr}`,
              type: type as 'Completo' | 'Incremental' | 'Diferencial',
              date: `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}T${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`,
              size: this.formatFileSize(stats.size),
              status: 'success',
              duration: '00:05:32'
            });
          }
        }
      }
      
      // Calcular estatísticas de resumo
      const summary: BackupSummaryStats = this.calculateBackupStats(backups);
      
      return { backups, summary };
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      throw error;
    }
  }

  /**
   * Cria um novo backup
   */
  public async createBackup(type: string, description?: string): Promise<any> {
    try {
      const backupId = uuidv4();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = now.toTimeString().substring(0, 8).replace(/:/g, '');
      
      const backupName = `backup_${dateStr}_${timeStr}_${type.toLowerCase()}`;
      const fileName = `${backupName}.zip`;
      const filePath = path.join(this.backupDir, fileName);
      
      if (this.mockMode) {
        // No modo de simulação, não executa o backup real
        // apenas retorna um mock para testes de interface
        return {
          id: backupId,
          name: backupName,
          file: fileName,
          path: filePath,
          status: 'in_progress'
        };
      }
      
      // Adicionar tarefa de backup à fila
      await addBackupJob(
        type === 'Completo' ? JobTypes.BACKUP_DATABASE : JobTypes.BACKUP_FILES, 
        {
          id: backupId,
          name: backupName,
          type,
          description,
          filePath,
          date: now.toISOString()
        }
      );
      
      return {
        id: backupId,
        name: backupName,
        file: fileName,
        path: filePath,
        status: 'in_progress'
      };
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  }

  /**
   * Exclui um backup pelo ID
   */
  public async deleteBackup(backupId: string): Promise<{ success: boolean, message?: string }> {
    try {
      if (this.mockMode) {
        // No modo de simulação, não exclui arquivo real
        return {
          success: true,
          message: 'Backup removido com sucesso'
        };
      }
      
      // Verificar se o arquivo existe
      const filePath = path.join(this.backupDir, `${backupId}.zip`);
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'Backup não encontrado'
        };
      }
      
      // Excluir o arquivo
      fs.unlinkSync(filePath);
      
      return {
        success: true,
        message: 'Backup removido com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao excluir backup:', error);
      return {
        success: false,
        message: `Erro ao excluir backup: ${error.message}`
      };
    }
  }

  /**
   * Obtém informações para download de um backup
   */
  public async getBackupDownloadInfo(backupId: string): Promise<{ 
    success: boolean, 
    message?: string, 
    downloadUrl?: string, 
    filePath?: string, 
    fileName?: string 
  }> {
    try {
      if (this.mockMode) {
        // No modo de simulação, não tem arquivo real para download
        return {
          success: true,
          filePath: path.join(this.backupDir, `${backupId}.zip`),
          fileName: `${backupId}.zip`
        };
      }
      
      // Verificar se o arquivo existe
      const filePath = path.join(this.backupDir, `${backupId}.zip`);
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'Backup não encontrado'
        };
      }
      
      return {
        success: true,
        filePath,
        fileName: `${backupId}.zip`
      };
    } catch (error: any) {
      console.error('Erro ao obter informações de download do backup:', error);
      return {
        success: false,
        message: `Erro ao obter informações de download: ${error.message}`
      };
    }
  }

  /**
   * Restaura um backup
   */
  public async restoreBackup(backupId: string): Promise<{ 
    success: boolean, 
    message?: string, 
    notFound?: boolean,
    jobId?: string 
  }> {
    try {
      if (this.mockMode) {
        // No modo de simulação, não restaura de verdade
        return {
          success: true,
          jobId: uuidv4(),
          message: 'Restauração iniciada com sucesso (simulação)'
        };
      }
      
      // Verificar se o arquivo existe
      const filePath = path.join(this.backupDir, `${backupId}.zip`);
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          notFound: true,
          message: 'Backup não encontrado'
        };
      }
      
      // Aqui implementaria a lógica real de restauração
      // Possivelmente usando uma fila para processo assíncrono
      
      return {
        success: true,
        jobId: uuidv4(),
        message: 'Restauração iniciada com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao restaurar backup:', error);
      return {
        success: false,
        message: `Erro ao restaurar backup: ${error.message}`
      };
    }
  }

  /**
   * Formata o tamanho do arquivo para exibição amigável
   */
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Calcula estatísticas de resumo dos backups
   */
  private calculateBackupStats(backups: Backup[]): BackupSummaryStats {
    const summary: BackupSummaryStats = {};
    
    // Ordenar backups por data (mais recente primeiro)
    const sortedBackups = [...backups].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Último backup
    if (sortedBackups.length > 0) {
      const lastBackup = sortedBackups[0];
      summary.lastBackupDate = new Date(lastBackup.date).toLocaleDateString('pt-BR');
      summary.lastBackupStatus = lastBackup.status;
    }
    
    // Simulação de próximo backup (exemplo)
    const now = new Date();
    const nextBackup = new Date(now);
    nextBackup.setDate(nextBackup.getDate() + 1); // Próximo backup amanhã
    nextBackup.setHours(3, 0, 0, 0); // às 3:00 da manhã
    
    summary.nextBackupDate = nextBackup.toLocaleDateString('pt-BR');
    summary.nextBackupTime = nextBackup.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Cálculo de espaço usado (exemplo)
    const totalSizeBytes = backups.reduce((total, backup) => {
      const sizeStr = backup.size;
      const sizeMatch = sizeStr.match(/(\d+\.?\d*)\s*(\w+)/);
      
      if (sizeMatch) {
        const size = parseFloat(sizeMatch[1]);
        const unit = sizeMatch[2];
        
        const unitFactor = {
          'Bytes': 1,
          'KB': 1024,
          'MB': 1024 * 1024,
          'GB': 1024 * 1024 * 1024,
          'TB': 1024 * 1024 * 1024 * 1024
        }[unit] || 1;
        
        return total + size * unitFactor;
      }
      
      return total;
    }, 0);
    
    summary.usedSpace = this.formatFileSize(totalSizeBytes);
    summary.totalSpace = '50 GB'; // Exemplo
    
    return summary;
  }

  /**
   * Gera dados de backup simulados para testes de interface
   */
  private getMockBackups(): { backups: Backup[], summary: BackupSummaryStats } {
    const now = new Date();
    
    // Criar alguns backups simulados
    const backups: Backup[] = [
      {
        id: 'backup_20230601_120000_completo',
        name: 'Backup 01/06/2023 12:00',
        type: 'Completo',
        date: '2023-06-01T12:00:00',
        size: '2.3 GB',
        status: 'success',
        duration: '00:15:22'
      },
      {
        id: 'backup_20230608_030000_incremental',
        name: 'Backup 08/06/2023 03:00',
        type: 'Incremental',
        date: '2023-06-08T03:00:00',
        size: '450 MB',
        status: 'success',
        duration: '00:05:13'
      },
      {
        id: 'backup_20230615_030000_diferencial',
        name: 'Backup 15/06/2023 03:00',
        type: 'Diferencial',
        date: '2023-06-15T03:00:00',
        size: '1.1 GB',
        status: 'success',
        duration: '00:08:45'
      },
      {
        id: 'backup_20230622_030000_completo',
        name: 'Backup 22/06/2023 03:00',
        type: 'Completo',
        date: '2023-06-22T03:00:00',
        size: '2.5 GB',
        status: 'failed',
        duration: '00:02:17'
      },
      {
        id: 'backup_20230629_030000_incremental',
        name: 'Backup 29/06/2023 03:00',
        type: 'Incremental',
        date: '2023-06-29T03:00:00',
        size: '520 MB',
        status: 'success',
        duration: '00:06:02'
      }
    ];
    
    // Adicionar backup mais recente "em andamento"
    const todayDate = now.toISOString().split('T')[0];
    const todayTime = now.toTimeString().substring(0, 8);
    
    if (Math.random() > 0.7) { // 30% de chance de mostrar um backup em andamento
      backups.unshift({
        id: `backup_${todayDate.replace(/-/g, '')}_${todayTime.replace(/:/g, '')}_completo`,
        name: `Backup ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`,
        type: 'Completo',
        date: now.toISOString(),
        size: '1.2 GB (estimado)',
        status: 'in_progress'
      });
    }
    
    // Calcular estatísticas de resumo
    const summary = this.calculateBackupStats(backups);
    
    return { backups, summary };
  }
} 