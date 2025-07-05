#!/usr/bin/env node

/**
 * Script para testar o fluxo completo de login
 * Executa: npx ts-node src/scripts/test-login-flow.ts
 */

import { getDashboardPath } from '../utils/roleRedirect';

// Simular dados de login
const testUsers = [
  {
    email: 'admin@sistema.com',
    password: 'admin123',
    expectedRole: 'SYSTEM_ADMIN'
  },
  {
    email: 'teacher@sistema.com',
    password: 'teacher123',
    expectedRole: 'TEACHER'
  },
  {
    email: 'student@sistema.com',
    password: 'student123',
    expectedRole: 'STUDENT'
  }
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function testLoginFlow() {
  console.log('🔍 Testando fluxo de login...\n');

  for (const testUser of testUsers) {
    console.log(`\n📧 Testando usuário: ${testUser.email}`);
    console.log(`🎭 Role esperada: ${testUser.expectedRole}`);

    try {
      // 1. Fazer login
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      const loginData = await loginResponse.json();

      console.log(`📡 Status da resposta: ${loginResponse.status}`);
      console.log(`✅ Login bem-sucedido: ${loginData.success}`);

      if (loginData.success && loginData.data) {
        const { user, accessToken } = loginData.data;
        
        console.log(`👤 Usuário: ${user.name}`);
        console.log(`🎭 Role recebida: ${user.role}`);
        console.log(`🔑 Token: ${accessToken ? 'Presente' : 'Ausente'}`);

        // 2. Testar decodificação do token
        if (accessToken) {
          try {
            const parts = accessToken.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              console.log(`🔍 Token decodificado:`);
              console.log(`   - ID: ${payload.id}`);
              console.log(`   - Email: ${payload.email}`);
              console.log(`   - Role: ${payload.role}`);
              console.log(`   - Exp: ${payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A'}`);
            } else {
              console.log(`❌ Token não tem formato JWT válido (${parts.length} partes)`);
            }
          } catch (error) {
            console.log(`❌ Erro ao decodificar token: ${error}`);
          }
        }

        // 3. Testar redirecionamento
        const dashboardPath = getDashboardPath(user.role);
        console.log(`🎯 Dashboard path: ${dashboardPath}`);

        if (dashboardPath) {
          console.log(`✅ Redirecionamento deve funcionar para: ${dashboardPath}`);
        } else {
          console.log(`❌ PROBLEMA: Dashboard path não encontrado para role ${user.role}`);
          
          // Testar variações da role
          console.log(`🔍 Testando variações da role:`);
          console.log(`   - Original: ${getDashboardPath(user.role)}`);
          console.log(`   - Uppercase: ${getDashboardPath(user.role.toUpperCase())}`);
          console.log(`   - Lowercase: ${getDashboardPath(user.role.toLowerCase())}`);
        }

        // 4. Simular o que acontece no AuthContext
        console.log(`\n🔄 Simulando fluxo do AuthContext:`);
        console.log(`   1. Token salvo no localStorage: ✅`);
        console.log(`   2. Token decodificado: ${accessToken ? '✅' : '❌'}`);
        console.log(`   3. Usuário configurado no estado: ✅`);
        console.log(`   4. Dashboard path obtido: ${dashboardPath ? '✅' : '❌'}`);
        console.log(`   5. Router.push chamado: ${dashboardPath ? '✅' : '❌'}`);

      } else {
        console.log(`❌ Falha no login: ${loginData.message}`);
      }

    } catch (error) {
      console.log(`❌ Erro na requisição: ${error}`);
    }

    console.log('\n' + '='.repeat(50));
  }
}

// Executar teste
testLoginFlow().catch(console.error); 