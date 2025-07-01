// Middleware para verificar se o usuário é administrador
module.exports = function adminMiddleware(req, res, next) {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verificar se o usuário tem role de admin
    const adminRoles = ['admin', 'system_admin', 'administrator', 'SYSTEM_ADMIN', 'ADMIN'];
    const userRole = req.user.role || req.user.role_name;
    
    // Debug: log para verificar o que está sendo recebido
    console.log('🔍 Admin Middleware Debug:');
    console.log('  req.user:', JSON.stringify(req.user, null, 2));
    console.log('  userRole:', userRole);
    console.log('  adminRoles:', adminRoles);
    console.log('  includes check:', adminRoles.includes(userRole));
    
    if (!adminRoles.includes(userRole)) {
      console.log('❌ Acesso negado para role:', userRole);
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
      });
    }
    
    console.log('✅ Acesso permitido para role:', userRole);

    // Usuário é admin, continuar
    next();
  } catch (error) {
    console.log('Erro no middleware de admin:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
}; 