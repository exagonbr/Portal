const fs = require('fs');
const path = require('path');

// Rotas que precisam de serviços no frontend
const routesToGenerate = [
  { route: 'notification-queue', name: 'NotificationQueue' },
  { route: 'teacher-subject', name: 'TeacherSubject' },
  { route: 'watchlist-entry', name: 'WatchlistEntry' },
];

// Template para serviços básicos
function generateServiceTemplate(routeName, serviceName) {
  const camelCaseName = serviceName.charAt(0).toLowerCase() + serviceName.slice(1);
  
  return `import { BaseApiService } from './base-api-service';

export interface ${serviceName} {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Create${serviceName}Dto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Update${serviceName}Dto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ${serviceName}Response {
  data: ${serviceName}[];
  total: number;
}

class ${serviceName}Service extends BaseApiService<${serviceName}> {
  constructor() {
    super('/api/${routeName}');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<${serviceName}Response> {
    const response = await fetch(\`\${this.basePath}?page=\${page}&limit=\${limit}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar ${camelCaseName}s');
    }

    return response.json();
  }

  async search(query: string): Promise<${serviceName}[]> {
    const response = await fetch(\`\${this.basePath}/search?q=\${encodeURIComponent(query)}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar ${camelCaseName}s');
    }

    return response.json();
  }

  async toggleActive(id: string): Promise<${serviceName}> {
    const response = await fetch(\`\${this.basePath}/\${id}/toggle-active\`, {
      method: 'PUT',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao alterar status do ${camelCaseName}');
    }

    return response.json();
  }

  async getActive(): Promise<${serviceName}[]> {
    const response = await fetch(\`\${this.basePath}/active\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar ${camelCaseName}s ativos');
    }

    return response.json();
  }
}

export const ${camelCaseName}Service = new ${serviceName}Service();`;
}

// Gerar serviços específicos
const specificServices = {
  'notification-queue': `import { BaseApiService } from './base-api-service';

export interface NotificationQueue {
  id: string;
  type: string;
  description?: string;
  movieId?: string;
  tvShowId?: string;
  videoToPlayId?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationQueueDto {
  type: string;
  description?: string;
  movieId?: string;
  tvShowId?: string;
  videoToPlayId?: string;
}

export interface UpdateNotificationQueueDto {
  type?: string;
  description?: string;
  movieId?: string;
  tvShowId?: string;
  videoToPlayId?: string;
  isCompleted?: boolean;
}

export interface NotificationQueueResponse {
  data: NotificationQueue[];
  total: number;
}

class NotificationQueueService extends BaseApiService<NotificationQueue> {
  constructor() {
    super('/api/notification-queue');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<NotificationQueueResponse> {
    const response = await fetch(\`\${this.basePath}?page=\${page}&limit=\${limit}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar fila de notificações');
    }

    return response.json();
  }

  async getPending(): Promise<NotificationQueue[]> {
    const response = await fetch(\`\${this.basePath}/pending\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notificações pendentes');
    }

    return response.json();
  }

  async getCompleted(): Promise<NotificationQueue[]> {
    const response = await fetch(\`\${this.basePath}/completed\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notificações concluídas');
    }

    return response.json();
  }

  async markAsCompleted(id: string): Promise<NotificationQueue> {
    const response = await fetch(\`\${this.basePath}/\${id}/complete\`, {
      method: 'PUT',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao marcar notificação como concluída');
    }

    return response.json();
  }

  async processQueue(): Promise<{ processed: number; errors: number }> {
    const response = await fetch(\`\${this.basePath}/process\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao processar fila de notificações');
    }

    return response.json();
  }

  async getByType(type: string): Promise<NotificationQueue[]> {
    const response = await fetch(\`\${this.basePath}/type/\${type}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar notificações por tipo');
    }

    return response.json();
  }

  async clearCompleted(): Promise<{ deleted: number }> {
    const response = await fetch(\`\${this.basePath}/clear-completed\`, {
      method: 'DELETE',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao limpar notificações concluídas');
    }

    return response.json();
  }
}

export const notificationQueueService = new NotificationQueueService();`,

  'teacher-subject': `import { BaseApiService } from './base-api-service';

export interface TeacherSubject {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherSubjectDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTeacherSubjectDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface TeacherSubjectResponse {
  data: TeacherSubject[];
  total: number;
}

class TeacherSubjectService extends BaseApiService<TeacherSubject> {
  constructor() {
    super('/api/teacher-subject');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<TeacherSubjectResponse> {
    const response = await fetch(\`\${this.basePath}?page=\${page}&limit=\${limit}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar matérias de professor');
    }

    return response.json();
  }

  async search(query: string): Promise<TeacherSubject[]> {
    const response = await fetch(\`\${this.basePath}/search?q=\${encodeURIComponent(query)}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar matérias de professor');
    }

    return response.json();
  }

  async getActive(): Promise<TeacherSubject[]> {
    const response = await fetch(\`\${this.basePath}/active\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar matérias ativas');
    }

    return response.json();
  }

  async toggleActive(id: string): Promise<TeacherSubject> {
    const response = await fetch(\`\${this.basePath}/\${id}/toggle-active\`, {
      method: 'PUT',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao alterar status da matéria');
    }

    return response.json();
  }

  async getByTeacher(teacherId: string): Promise<TeacherSubject[]> {
    const response = await fetch(\`\${this.basePath}/teacher/\${teacherId}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar matérias do professor');
    }

    return response.json();
  }

  async assignToTeacher(subjectId: string, teacherId: string): Promise<{ success: boolean }> {
    const response = await fetch(\`\${this.basePath}/\${subjectId}/assign-teacher\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teacherId }),
    });

    if (!response.ok) {
      throw new Error('Falha ao atribuir matéria ao professor');
    }

    return response.json();
  }
}

export const teacherSubjectService = new TeacherSubjectService();`,

  'watchlist-entry': `import { BaseApiService } from './base-api-service';

export interface WatchlistEntry {
  id: string;
  userId: string;
  videoId: string;
  addedAt: string;
  watched: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  video?: {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: number;
  };
}

export interface CreateWatchlistEntryDto {
  userId: string;
  videoId: string;
}

export interface UpdateWatchlistEntryDto {
  watched?: boolean;
}

export interface WatchlistEntryResponse {
  data: WatchlistEntry[];
  total: number;
}

class WatchlistEntryService extends BaseApiService<WatchlistEntry> {
  constructor() {
    super('/api/watchlist-entry');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<WatchlistEntryResponse> {
    const response = await fetch(\`\${this.basePath}?page=\${page}&limit=\${limit}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar lista de observação');
    }

    return response.json();
  }

  async getByUserId(userId: string): Promise<WatchlistEntry[]> {
    const response = await fetch(\`\${this.basePath}/user/\${userId}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar lista de observação do usuário');
    }

    return response.json();
  }

  async getCurrentUserWatchlist(): Promise<WatchlistEntry[]> {
    const response = await fetch(\`\${this.basePath}/my-watchlist\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar minha lista de observação');
    }

    return response.json();
  }

  async addToWatchlist(videoId: string): Promise<WatchlistEntry> {
    const response = await fetch(\`\${this.basePath}/add\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) {
      throw new Error('Falha ao adicionar à lista de observação');
    }

    return response.json();
  }

  async removeFromWatchlist(videoId: string): Promise<{ success: boolean }> {
    const response = await fetch(\`\${this.basePath}/remove/\${videoId}\`, {
      method: 'DELETE',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao remover da lista de observação');
    }

    return response.json();
  }

  async markAsWatched(id: string): Promise<WatchlistEntry> {
    const response = await fetch(\`\${this.basePath}/\${id}/watched\`, {
      method: 'PUT',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao marcar como assistido');
    }

    return response.json();
  }

  async markAsUnwatched(id: string): Promise<WatchlistEntry> {
    const response = await fetch(\`\${this.basePath}/\${id}/unwatched\`, {
      method: 'PUT',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao marcar como não assistido');
    }

    return response.json();
  }

  async getWatchedVideos(userId?: string): Promise<WatchlistEntry[]> {
    let url = \`\${this.basePath}/watched\`;
    if (userId) {
      url += \`?userId=\${userId}\`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar vídeos assistidos');
    }

    return response.json();
  }

  async getUnwatchedVideos(userId?: string): Promise<WatchlistEntry[]> {
    let url = \`\${this.basePath}/unwatched\`;
    if (userId) {
      url += \`?userId=\${userId}\`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar vídeos não assistidos');
    }

    return response.json();
  }

  async clearWatchlist(userId?: string): Promise<{ deleted: number }> {
    let url = \`\${this.basePath}/clear\`;
    if (userId) {
      url += \`?userId=\${userId}\`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao limpar lista de observação');
    }

    return response.json();
  }

  async isInWatchlist(videoId: string): Promise<boolean> {
    const response = await fetch(\`\${this.basePath}/check/\${videoId}\`, {
      headers: {
        'Authorization': \`Bearer \${localStorage.getItem('accessToken')}\`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao verificar se está na lista');
    }

    const result = await response.json();
    return result.inWatchlist;
  }
}

export const watchlistEntryService = new WatchlistEntryService();`
};

// Função para criar os arquivos de serviço
function createServices() {
  console.log('🚀 GERANDO SERVIÇOS DO FRONTEND\n');
  console.log('=' .repeat(50));

  const servicesDir = path.join(__dirname, 'src', 'services');
  
  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
  }

  let generated = 0;

  // Gerar serviços específicos
  Object.keys(specificServices).forEach(routeName => {
    const fileName = routeName.replace(/-/g, '') + 'Service.ts';
    const filePath = path.join(servicesDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, specificServices[routeName]);
      console.log(`✅ Serviço criado: ${fileName}`);
      generated++;
    } else {
      console.log(`⚠️ Serviço já existe: ${fileName}`);
    }
  });

  console.log(`\n🎉 GERAÇÃO CONCLUÍDA!`);
  console.log(`📊 Serviços gerados: ${generated}`);
  console.log(`📋 Total de serviços específicos: ${Object.keys(specificServices).length}`);
}

// Executar a geração
createServices(); 