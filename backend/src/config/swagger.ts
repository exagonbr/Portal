import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Portal Sabercon API',
    version: '2.0.0',
    description: `
# Portal Sabercon API Documentation

## Visão Geral
API completa para a plataforma educacional Portal Sabercon, incluindo:
- 🔐 Sistema de autenticação com JWT
- 📱 Gerenciamento de sessões Redis
- 📊 Dashboard e analytics
- 👥 Gestão de usuários e instituições
- 📚 Sistema de cursos e conteúdo
- 💬 Chat e fóruns
- 📈 Progresso e avaliações

## Autenticação
A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login através do endpoint \`POST /api/sessions/login\`
2. Use o token retornado no header \`Authorization: Bearer <token>\`
3. O sistema também gerencia sessões Redis para maior segurança

## Rate Limiting
- A API implementa rate limiting para proteger contra abuso
- Limites variam por endpoint e tipo de usuário

## Versionamento
- Versão atual: v2.0.0
- Compatibilidade com versões anteriores mantida quando possível
    `,
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'Portal Sabercon Team',
      email: 'dev@portal.sabercon.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3001}`,
      description: 'Development server',
    },
    {
      url: 'https://api.portal.sabercon.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Digite o token JWT no formato: Bearer <token>',
      },
    },
    schemas: {
      // ===============================
      // SCHEMAS DE AUTENTICAÇÃO E SESSÃO
      // ===============================
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@portal.com' },
          password: { type: 'string', example: 'password123' },
          deviceType: { type: 'string', example: 'web', description: 'Tipo do dispositivo (opcional)' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login realizado com sucesso' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'refresh_token_here' },
          user: { $ref: '#/components/schemas/User' },
          session: { $ref: '#/components/schemas/SessionInfo' },
        },
      },
      SessionInfo: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', example: 'sess_123456789' },
          userId: { type: 'string', format: 'uuid' },
          deviceType: { type: 'string', example: 'web' },
          ipAddress: { type: 'string', example: '192.168.1.1' },
          userAgent: { type: 'string', example: 'Mozilla/5.0...' },
          createdAt: { type: 'number', example: 1640995200000 },
          lastActivity: { type: 'number', example: 1640995200000 },
          isActive: { type: 'boolean', example: true },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'refresh_token_here' },
        },
      },
      SessionStats: {
        type: 'object',
        properties: {
          activeUsers: { type: 'number', example: 150 },
          totalActiveSessions: { type: 'number', example: 200 },
          sessionsByDevice: {
            type: 'object',
            properties: {
              web: { type: 'number', example: 120 },
              mobile: { type: 'number', example: 60 },
              tablet: { type: 'number', example: 20 },
            },
          },
        },
      },

      // ===============================
      // SCHEMAS DE DASHBOARD
      // ===============================
      DashboardStats: {
        type: 'object',
        properties: {
          users: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 1500 },
              active: { type: 'number', example: 1200 },
              newThisMonth: { type: 'number', example: 50 },
              byRole: {
                type: 'object',
                additionalProperties: { type: 'number' },
                example: { admin: 5, teacher: 100, student: 1395 },
              },
              byInstitution: {
                type: 'object',
                additionalProperties: { type: 'number' },
                example: { 'Universidade ABC': 800, 'Faculdade XYZ': 700 },
              },
            },
          },
          sessions: { $ref: '#/components/schemas/SessionStats' },
          system: {
            type: 'object',
            properties: {
              uptime: { type: 'number', example: 3600 },
              memoryUsage: {
                type: 'object',
                properties: {
                  rss: { type: 'number', example: 104857600 },
                  heapTotal: { type: 'number', example: 83886080 },
                  heapUsed: { type: 'number', example: 67108864 },
                  external: { type: 'number', example: 8388608 },
                },
              },
              version: { type: 'string', example: '2.0.0' },
              environment: { type: 'string', example: 'production' },
            },
          },
          recent: {
            type: 'object',
            properties: {
              registrations: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' },
              },
              logins: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
      UserDashboard: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: { $ref: '#/components/schemas/User' },
              stats: {
                type: 'object',
                properties: {
                  coursesEnrolled: { type: 'number', example: 5 },
                  coursesCompleted: { type: 'number', example: 2 },
                  totalStudyTime: { type: 'number', example: 1200 },
                  achievements: { type: 'number', example: 8 },
                },
              },
            },
          },
          courses: {
            type: 'object',
            properties: {
              inProgress: {
                type: 'array',
                items: { $ref: '#/components/schemas/Course' },
              },
              completed: {
                type: 'array',
                items: { $ref: '#/components/schemas/Course' },
              },
              recent: {
                type: 'array',
                items: { $ref: '#/components/schemas/Course' },
              },
            },
          },
          activity: {
            type: 'object',
            properties: {
              recentSessions: {
                type: 'array',
                items: { $ref: '#/components/schemas/SessionInfo' },
              },
              studyStreak: { type: 'number', example: 7 },
              lastAccess: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      AnalyticsData: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['users', 'sessions', 'activity'] },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date' },
                value: { type: 'number' },
              },
            },
          },
        },
      },
      RealTimeMetrics: {
        type: 'object',
        properties: {
          activeUsers: { type: 'number', example: 150 },
          activeSessions: { type: 'number', example: 200 },
          redisMemory: { type: 'string', example: '45.2MB' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      SystemHealth: {
        type: 'object',
        properties: {
          api: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'degraded', 'down'] },
              responseTime: { type: 'number', example: 150 },
            },
          },
          database: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['connected', 'disconnected', 'error'] },
              connectionCount: { type: 'number', example: 10 },
            },
          },
          redis: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['connected', 'disconnected', 'error'] },
              memoryUsage: { type: 'string', example: '45.2MB' },
              connectedClients: { type: 'number', example: 25 },
            },
          },
        },
      },

      // ===============================
      // SCHEMAS PRINCIPAIS
      // ===============================
      Institution: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          code: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          phone: { type: 'string' },
          role: { $ref: '#/components/schemas/Role' },
          institution: { $ref: '#/components/schemas/Institution' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          institution_id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Book: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          author: { type: 'string' },
          isbn: { type: 'string' },
          course_id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Video: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          url: { type: 'string' },
          duration: { type: 'number' },
          course_id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Module: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          course_id: { type: 'string', format: 'uuid' },
          order: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Lesson: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          module_id: { type: 'string', format: 'uuid' },
          order: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      UserProgress: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          lesson_id: { type: 'string', format: 'uuid' },
          completed: { type: 'boolean' },
          progress_percentage: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Annotation: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          page_number: { type: 'number' },
          book_id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Highlight: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          page_number: { type: 'number' },
          book_id: { type: 'string', format: 'uuid' },
          color: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Role: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['system', 'custom'] },
          user_count: { type: 'number' },
          status: { type: 'string', enum: ['active', 'inactive'] },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Permission: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          resource: { type: 'string' },
          action: { type: 'string', enum: ['create', 'read', 'update', 'delete'] },
          description: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Quiz: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          course_id: { type: 'string', format: 'uuid' },
          questions: { type: 'array', items: { type: 'object' } },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Chat: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['direct', 'group', 'course'] },
          course_id: { type: 'string', format: 'uuid' },
          created_by: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Forum: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          course_id: { type: 'string', format: 'uuid' },
          author_id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      ContentCollection: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
          institution_id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },

      // ===============================
      // SCHEMAS DE RESPOSTA PADRÃO
      // ===============================
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Erro interno do servidor' },
          error: { type: 'string', example: 'INTERNAL_SERVER_ERROR' },
          details: { type: 'object', description: 'Detalhes adicionais do erro (apenas em desenvolvimento)' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Dados de entrada inválidos' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Email é obrigatório' },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: '🔐 Autenticação e autorização de usuários',
    },
    {
      name: 'Sessions',
      description: '📱 Gerenciamento de sessões Redis e JWT',
    },
    {
      name: 'Dashboard',
      description: '📊 Dashboard, analytics e métricas do sistema',
    },
    {
      name: 'Users',
      description: '👥 Gestão de usuários e perfis',
    },
    {
      name: 'Institution',
      description: '🏢 Gestão de instituições de ensino',
    },
    {
      name: 'Courses',
      description: '📚 Gestão de cursos e conteúdo educacional',
    },
    {
      name: 'Progress',
      description: '📈 Acompanhamento de progresso e avaliações',
    },
    {
      name: 'Communication',
      description: '💬 Chat, fóruns e comunicação',
    },
    {
      name: 'System',
      description: '⚙️ Configurações e administração do sistema',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts',
    './src/middleware/*.ts',
    './src/services/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
