// Script para verificar variáveis de ambiente
export function checkEnvironmentVariables() {
  console.log('🔍 Verificando variáveis de ambiente...\n');
  
  const envVars = {
    'NODE_ENV': process.env.NODE_ENV,
    'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
    'NEXT_PUBLIC_BACKEND_URL': process.env.NEXT_PUBLIC_BACKEND_URL,
    'BACKEND_URL': process.env.BACKEND_URL,
    'INTERNAL_API_URL': process.env.INTERNAL_API_URL,
    'JWT_SECRET': process.env.JWT_SECRET ? '***DEFINIDO***' : 'NÃO DEFINIDO',
    'DATABASE_URL': process.env.DATABASE_URL ? '***DEFINIDO***' : 'NÃO DEFINIDO',
  };
  
  console.table(envVars);
  
  // Verificar URLs de API
  console.log('\n📡 URLs de API configuradas:');
  console.log('- API Base URL (frontend):', process.env.NEXT_PUBLIC_API_URL || '/api');
  console.log('- Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL || 'https://portal.sabercon.com.br/api');
  
  // Verificar se estamos em desenvolvimento ou produção
  console.log('\n🏗️ Ambiente:');
  console.log('- Modo:', process.env.NODE_ENV);
  console.log('- É produção?', process.env.NODE_ENV === 'production');
  console.log('- É desenvolvimento?', process.env.NODE_ENV === 'development');
  
  // Sugestões
  console.log('\n💡 Sugestões:');
  if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
    console.log('⚠️ NEXT_PUBLIC_BACKEND_URL não está definida. O sistema usará o valor padrão.');
  }
  if (!process.env.JWT_SECRET) {
    console.log('⚠️ JWT_SECRET não está definida. Isso pode causar problemas de autenticação.');
  }
  
  return envVars;
}

// Executar automaticamente se chamado diretamente
if (typeof window !== 'undefined') {
  (window as any).checkEnv = checkEnvironmentVariables;
}