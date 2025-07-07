import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Verificar se NEXTAUTH_SECRET está definido
if (!process.env.NEXTAUTH_SECRET) {
  console.error('⚠️ NEXTAUTH_SECRET não está definido! Isso causará erros de CLIENT_FETCH_ERROR');
  console.error('💡 Solução: Adicione NEXTAUTH_SECRET ao seu arquivo .env ou .env.local');
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };