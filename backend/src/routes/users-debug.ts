import express from 'express';
import {
  optimizedAuthMiddleware,
  requireAnyRole
} from '../middleware/optimizedAuth.middleware';
import { UserRepository } from '../repositories/UserRepository';
import * as jwt from 'jsonwebtoken';

const router = express.Router();
const userRepository = new UserRepository();

// Rota para gerar JWT de teste
router.get('/generate-test-jwt', async (req, res) => {
  try {
    console.log('🔧 [DEBUG] Gerando JWT de teste...');
    
    const secret = process.env.JWT_SECRET || 'ExagonTech';
    const payload = {
      userId: 'test-admin-id',
      email: 'admin@sabercon.com.br',
      name: 'Admin Test',
      role: 'SYSTEM_ADMIN',
      institutionId: 'test-institution',
      permissions: [
        'system.admin',
        'users.manage',
        'institutions.manage',
        'units.manage'
      ],
      sessionId: 'session_' + Date.now(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };
    
    const token = jwt.sign(payload, secret);
    
    console.log('✅ [DEBUG] JWT gerado com sucesso');
    console.log('🔍 [DEBUG] Payload:', payload);
    console.log('🔍 [DEBUG] Secret usado:', secret);
    
    return res.json({
      success: true,
      message: 'JWT de teste gerado com sucesso',
      data: {
        token,
        payload,
        secret: secret,
        usage: {
          curl: `curl -H "Authorization: Bearer ${token}" "https://portal.sabercon.com.br/api/users?page=1&limit=10"`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        },
        expires: new Date((payload.exp) * 1000).toISOString()
      }
    });
  } catch (error: any) {
    console.error('❌ [DEBUG] Erro ao gerar JWT:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar JWT de teste',
      error: error.message
    });
  }
});

// Rota para testar validação JWT
router.get('/test-jwt-validation', optimizedAuthMiddleware, async (req, res) => {
  try {
    console.log('🧪 [DEBUG] Testando validação JWT...');
    console.log('🔍 [DEBUG] req.user:', req.user);
    
    return res.json({
      success: true,
      message: 'JWT validado com sucesso',
      data: {
        user: req.user,
        timestamp: new Date().toISOString(),
        middleware: 'validateJWTSmart'
      }
    });
  } catch (error: any) {
    console.error('❌ [DEBUG] Erro na validação JWT:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro na validação JWT',
      error: error.message
    });
  }
});

// Rota para testar validação JWT + Role
router.get('/test-jwt-and-role',
  optimizedAuthMiddleware,
  requireAnyRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']),
  async (req, res) => {
    try {
      console.log('🧪 [DEBUG] Testando JWT + Role...');
      console.log('🔍 [DEBUG] req.user:', req.user);
      
      return res.json({
        success: true,
        message: 'JWT e Role validados com sucesso',
        data: {
          user: req.user,
          allowedRoles: ['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'manager'],
          userRole: (req.user as any)?.role,
          timestamp: new Date().toISOString(),
          middlewares: ['validateJWTSmart', 'requireRoleSmart']
        }
      });
    } catch (error: any) {
      console.error('❌ [DEBUG] Erro na validação JWT+Role:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro na validação JWT+Role',
        error: error.message
      });
    }
  }
);

// Rota para simular a mesma validação da rota /api/users original
router.get('/simulate-users-route',
  optimizedAuthMiddleware,
  requireAnyRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']),
  async (req, res) => {
    try {
      console.log('🎭 [DEBUG] Simulando rota /api/users...');
      console.log('🔍 [DEBUG] Query params:', req.query);
      console.log('🔍 [DEBUG] req.user:', req.user);
      
      // Simular a mesma lógica da rota original
      const { institution_id, role } = req.query;
      
      // Dados simulados para teste
      const mockUsers = [
        {
          id: 'user-1',
          email: 'admin@sabercon.com.br',
          name: 'Admin Simulado',
          role: 'SYSTEM_ADMIN',
          institution_id: 'inst-1',
          is_active: true,
          created_at: new Date().toISOString(),
          institution: {
            id: 'inst-1',
            name: 'Instituição Simulada'
          }
        },
        {
          id: 'user-2',
          email: 'teacher@sabercon.com.br',
          name: 'Professor Simulado',
          role: 'TEACHER',
          institution_id: 'inst-1',
          is_active: true,
          created_at: new Date().toISOString(),
          institution: {
            id: 'inst-1',
            name: 'Instituição Simulada'
          }
        }
      ];
      
      // Aplicar filtros se fornecidos
      let filteredUsers = mockUsers;
      if (institution_id) {
        filteredUsers = filteredUsers.filter(u => u.institution_id === institution_id);
      }
      if (role) {
        filteredUsers = filteredUsers.filter(u => u.role === role);
      }
      
      return res.json({
        success: true,
        data: filteredUsers,
        total: filteredUsers.length,
        debug: {
          message: 'Simulação da rota /api/users',
          filters: { institution_id, role },
          user: req.user,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('❌ [DEBUG] Erro na simulação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro na simulação da rota users',
        error: error.message
      });
    }
  }
);

// Rota para diagnóstico completo
router.get('/full-diagnosis', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Iniciando diagnóstico completo...');
    
    const authHeader = req.headers.authorization;
    const hasAuthHeader = !!authHeader;
    const token = authHeader?.substring(7);
    
    let tokenInfo = null;
    
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'ExagonTech';
        const decoded = jwt.verify(token, secret) as any;
        tokenInfo = {
          valid: true,
          payload: decoded,
          expires: new Date(decoded.exp * 1000).toISOString()
        };
      } catch (jwtError: any) {
        tokenInfo = {
          valid: false,
          error: jwtError.message,
          name: jwtError.name
        };
      }
    }
    
    // Testar conexão com banco
    let dbConnection = null;
    try {
      const testCount = await userRepository.count();
      dbConnection = {
        status: 'connected',
        userCount: testCount
      };
    } catch (dbError: any) {
      dbConnection = {
        status: 'error',
        error: dbError.message
      };
    }
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
        port: process.env.PORT || 'default'
      },
      request: {
        hasAuthHeader,
        authHeaderFormat: authHeader ? authHeader.substring(0, 20) + '...' : null,
        tokenLength: token?.length || 0,
        userAgent: req.headers['user-agent'],
        origin: req.headers.origin
      },
      token: tokenInfo,
      database: dbConnection,
      middlewares: {
        validateJWTSmart: 'available',
        requireRoleSmart: 'available'
      }
    };
    
    console.log('✅ [DEBUG] Diagnóstico completo:', diagnosis);
    
    return res.json({
      success: true,
      message: 'Diagnóstico completo realizado',
      data: diagnosis
    });
  } catch (error: any) {
    console.error('❌ [DEBUG] Erro no diagnóstico:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro no diagnóstico completo',
      error: error.message
    });
  }
});

// Rota de debug para verificar estrutura da tabela
router.get('/debug-table', optimizedAuthMiddleware, requireAnyRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']), async (req, res) => {
  try {
    console.log('🔍 [DEBUG-TABLE] Verificando estrutura da tabela users...');
    
    const db = require('../config/database').default;
    const result = await db.raw("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    
    console.log('✅ [DEBUG-TABLE] Colunas encontradas:', result.rows.length);
    
    res.json({
      success: true,
      data: {
        columns: result.rows,
        total_columns: result.rows.length
      },
      message: 'Estrutura da tabela users'
    });
  } catch (error: any) {
    console.error('❌ [DEBUG-TABLE] Erro:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar estrutura da tabela',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;