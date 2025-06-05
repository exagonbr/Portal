// Middleware para verificar se o usuário é administrador
module.exports = function adminMiddleware(req, res, next) {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verificar se o usuário tem role de admin
    const adminRoles = ['admin', 'system_admin', 'administrator'];
    const userRole = req.user.role || req.user.role_name;
    
    if (!adminRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
      });
    }

    // Usuário é admin, continuar
    next();
  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
}; 