// Utilitário para validar e diagnosticar tokens JWT
import { jwtDecode } from 'jwt-decode';

export interface TokenValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  decodedToken?: any;
  tokenInfo: {
    hasToken: boolean;
    tokenType: string;
    tokenLength: number;
    partsCount: number;
  };
}

export function validateToken(token: string | null): TokenValidationResult {
  const result: TokenValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    tokenInfo: {
      hasToken: !!token,
      tokenType: typeof token,
      tokenLength: token?.length || 0,
      partsCount: 0
    }
  };

  // Verificação básica
  if (!token) {
    result.errors.push('Token não fornecido');
    return result;
  }

  if (typeof token !== 'string') {
    result.errors.push(`Token deve ser string, recebido: ${typeof token}`);
    return result;
  }

  if (token.length === 0) {
    result.errors.push('Token é uma string vazia');
    return result;
  }

  // Verificar formato JWT
  const parts = token.split('.');
  result.tokenInfo.partsCount = parts.length;

  if (parts.length !== 3) {
    result.errors.push(`Token JWT deve ter 3 partes, encontradas: ${parts.length}`);
    
    // Tentar como token base64 simples
    try {
      const decoded = atob(token);
      const parsed = JSON.parse(decoded);
      if (parsed && typeof parsed === 'object') {
        result.warnings.push('Token decodificado como base64 simples, não JWT');
        result.decodedToken = parsed;
        result.isValid = validateTokenContent(parsed, result);
        return result;
      }
    } catch (error) {
      result.errors.push('Falha ao decodificar como base64 simples');
    }
    
    return result;
  }

  // Tentar decodificar como JWT
  try {
    const decoded = jwtDecode(token);
    result.decodedToken = decoded;
    
    if (!decoded || typeof decoded !== 'object') {
      result.errors.push('Token decodificado não é um objeto válido');
      return result;
    }

    result.isValid = validateTokenContent(decoded, result);
    
  } catch (error) {
    result.errors.push(`Erro ao decodificar JWT: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }

  return result;
}

function validateTokenContent(decoded: any, result: TokenValidationResult): boolean {
  let isValid = true;

  // Verificar campos obrigatórios
  if (!decoded.id && !decoded.userId && !decoded.sub) {
    result.errors.push('Token não possui campo de identificação (id, userId ou sub)');
    isValid = false;
  }

  if (!decoded.email) {
    result.warnings.push('Token não possui campo email');
  }

  if (!decoded.role) {
    result.warnings.push('Token não possui campo role');
  }

  if (!decoded.name) {
    result.warnings.push('Token não possui campo name');
  }

  // Verificar expiração
  if (decoded.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      result.errors.push(`Token expirado. Expirou em: ${new Date(decoded.exp * 1000).toISOString()}`);
      isValid = false;
    } else {
      const timeLeft = decoded.exp - now;
      if (timeLeft < 300) { // 5 minutos
        result.warnings.push(`Token expira em breve: ${Math.floor(timeLeft / 60)} minutos`);
      }
    }
  } else {
    result.warnings.push('Token não possui campo de expiração (exp)');
  }

  // Verificar issued at
  if (decoded.iat) {
    const now = Math.floor(Date.now() / 1000);
    if (decoded.iat > now) {
      result.errors.push('Token foi emitido no futuro (iat inválido)');
      isValid = false;
    }
  }

  return isValid;
}

export function printTokenDiagnostics(token: string | null): void {
  console.group('🔍 Diagnóstico de Token JWT');
  
  const validation = validateToken(token);
  
  console.log('📋 Informações básicas:', validation.tokenInfo);
  
  if (validation.decodedToken) {
    console.log('📄 Token decodificado:', validation.decodedToken);
  }
  
  if (validation.errors.length > 0) {
    console.error('❌ Erros encontrados:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Avisos:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log(`✅ Token válido: ${validation.isValid ? 'SIM' : 'NÃO'}`);
  
  console.groupEnd();
}

// Função para validar token do localStorage
export function validateStoredToken(): TokenValidationResult {
  if (typeof window === 'undefined') {
    return {
      isValid: false,
      errors: ['Não está no ambiente do navegador'],
      warnings: [],
      tokenInfo: { hasToken: false, tokenType: 'undefined', tokenLength: 0, partsCount: 0 }
    };
  }

  const token = localStorage.getItem('accessToken');
  return validateToken(token);
}

// Tornar disponível globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).validateToken = validateToken;
  (window as any).printTokenDiagnostics = printTokenDiagnostics;
  (window as any).validateStoredToken = validateStoredToken;
  
  console.log('🔧 Funções de validação de token disponíveis:');
  console.log('- validateToken(token) - Valida um token específico');
  console.log('- printTokenDiagnostics(token) - Imprime diagnóstico detalhado');
  console.log('- validateStoredToken() - Valida token do localStorage');
} 