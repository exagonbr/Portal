import express from 'express';
import { validateJWTSmart, requireRoleSmart } from '../middleware/auth';
import { UserRepository } from '../repositories/UserRepository';

const router = express.Router();
const userRepository = new UserRepository();

// Rota de debug simplificada sem JOINs
router.get('/debug-simple', validateJWTSmart, requireRoleSmart(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Iniciando busca de usuários simplificada...');
    
    // Buscar usuários sem JOINs para evitar erros de tabela
    const users = await userRepository.findUsersWithoutPassword();
    
    console.log('✅ [DEBUG] Usuários encontrados:', users.length);
    
    res.json({
      success: true,
      data: users,
      total: users.length,
      message: 'Usuários obtidos com sucesso (versão debug)'
    });
  } catch (error: any) {
    console.error('❌ [DEBUG] Erro ao buscar usuários:', error);
    console.error('❌ [DEBUG] Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: 'Erro na versão debug simplificada'
    });
  }
});

// Rota de debug para testar conexão com banco
router.get('/debug-db', validateJWTSmart, requireRoleSmart(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    console.log('🔍 [DEBUG-DB] Testando conexão com banco...');
    
    const count = await userRepository.count();
    
    console.log('✅ [DEBUG-DB] Total de usuários:', count);
    
    res.json({
      success: true,
      data: {
        total_users: count,
        connection_status: 'OK'
      },
      message: 'Conexão com banco funcionando'
    });
  } catch (error: any) {
    console.error('❌ [DEBUG-DB] Erro de conexão:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro de conexão com banco',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: 'Erro na conexão com banco de dados'
    });
  }
});

export default router;