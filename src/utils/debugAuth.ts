export interface AuthDebugInfo {
  user: any;
  userRole: string | undefined;
  normalizedRole: string | undefined;
  dashboardPath: string | null;
  cookies: any;
  isValid: boolean;
  timestamp: string;
}

// Mapeamento local para evitar dependência circular
const ROLE_DASHBOARD_MAP_LOCAL: Record<string, string> = {
  'student': '/dashboard/student',
  'teacher': '/dashboard/teacher',
  'admin': '/dashboard/admin',
  'manager': '/dashboard/manager',
  'system_admin': '/dashboard/admin',
  'institution_manager': '/dashboard/institution-manager',
  'academic_coordinator': '/dashboard/coordinator',
  'guardian': '/dashboard/guardian',
  'aluno': '/dashboard/student',
  'professor': '/dashboard/teacher',
  'administrador': '/dashboard/admin',
  'gestor': '/dashboard/manager',
  'coordenador acadêmico': '/dashboard/coordinator',
  'responsável': '/dashboard/guardian',
  'Aluno': '/dashboard/student',
  'Professor': '/dashboard/teacher',
  'Administrador': '/dashboard/admin',
  'Gestor': '/dashboard/manager',
  'Coordenador Acadêmico': '/dashboard/coordinator',
  'Responsável': '/dashboard/guardian',
  'ALUNO': '/dashboard/student',
  'PROFESSOR': '/dashboard/teacher',
  'ADMINISTRADOR': '/dashboard/admin',
  'GESTOR': '/dashboard/manager',
  'COORDENADOR ACADÊMICO': '/dashboard/coordinator',
  'RESPONSÁVEL': '/dashboard/guardian',
  'STUDENT': '/dashboard/student',
  'TEACHER': '/dashboard/teacher',
  'SYSTEM_ADMIN': '/dashboard/admin',
  'INSTITUTION_MANAGER': '/dashboard/institution-manager',
  'ACADEMIC_COORDINATOR': '/dashboard/coordinator',
  'GUARDIAN': '/dashboard/guardian'
};

// Função local para obter dashboard path sem dependência circular
function getLocalDashboardPath(role: string | undefined | null): string | null {
  if (!role) return null;
  
  // Tenta busca exata
  let dashboardPath = ROLE_DASHBOARD_MAP_LOCAL[role];
  if (dashboardPath) return dashboardPath;
  
  // Tenta busca com lowercase
  const lowercaseRole = role.toLowerCase();
  dashboardPath = ROLE_DASHBOARD_MAP_LOCAL[lowercaseRole];
  if (dashboardPath) return dashboardPath;
  
  return null;
}

export function debugAuthState(): AuthDebugInfo {
  let user = null;
  let cookies = {};
  
  // Verificar dados do usuário no localStorage
  if (typeof window !== 'undefined') {
    try {
      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_data='));
      
      if (userDataCookie) {
        const userData = userDataCookie.split('=')[1];
        user = JSON.parse(decodeURIComponent(userData));
      }
      
      // Obter todos os cookies relevantes
      cookies = {
        auth_token: document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))?.split('=')[1] || null,
        user_data: userDataCookie?.split('=')[1] || null,
        session_id: document.cookie
          .split('; ')
          .find(row => row.startsWith('session_id='))?.split('=')[1] || null,
      };
    } catch (error) {
      console.error('Erro ao debug auth state:', error);
    }
  }

  const userRole = user?.role;
  const normalizedRole = userRole?.toLowerCase();
  
  // Usar função local para evitar dependência circular
  const dashboardPath = getLocalDashboardPath(normalizedRole || userRole);

  const isValid = !!(user && userRole);

  return {
    user,
    userRole,
    normalizedRole,
    dashboardPath,
    cookies,
    isValid,
    timestamp: new Date().toISOString()
  };
}

export function logAuthDebug(message: string, additionalData?: any) {
  const debugInfo = debugAuthState();
  
  console.group(`🔐 Auth Debug: ${message}`);
  console.log('📊 Estado da Autenticação:', debugInfo);
  if (additionalData) {
    console.log('📋 Dados Adicionais:', additionalData);
  }
  console.groupEnd();
}

export function validateAuthFlow() {
  const debugInfo = debugAuthState();
  const issues: string[] = [];

  if (!debugInfo.user) {
    issues.push('Usuário não encontrado nos cookies');
  }

  if (!debugInfo.userRole) {
    issues.push('Role do usuário não definida');
  }

  if (debugInfo.userRole && !debugInfo.dashboardPath) {
    issues.push(`Dashboard path não encontrado para a role: ${debugInfo.userRole}`);
  }

  if (!debugInfo.cookies.auth_token) {
    issues.push('Token de autenticação não encontrado');
  }

  if (issues.length > 0) {
    console.group('🚨 Problemas de Autenticação Detectados:');
    issues.forEach(issue => console.warn(`- ${issue}`));
    console.groupEnd();
  }

  return {
    hasIssues: issues.length > 0,
    issues,
    debugInfo
  };
} 