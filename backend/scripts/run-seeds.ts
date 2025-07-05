#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function main() {
  console.log('🚀 Executando seeds atualizados do sistema de roles...\n');

  try {
    // Verificar se o arquivo de configuração existe
    const knexfilePath = path.join(__dirname, '..', 'knexfile.ts');
    if (!fs.existsSync(knexfilePath)) {
      console.log('❌ Arquivo knexfile.ts não encontrado!');
      process.exit(1);
    }

    console.log('📋 Executando migration para garantir que o banco esteja atualizado...');
    execSync('npx knex migrate:latest --knexfile ./knexfile.ts', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    console.log('\n🌱 Executando seeds...');
    execSync('npx knex seed:run --knexfile ./knexfile.ts', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    console.log('\n✅ Seeds executados com sucesso!');
    console.log('\n🎯 Sistema de roles atualizado:');
    console.log('   • SYSTEM_ADMIN: Acesso completo de administrador');
    console.log('   • INSTITUTION_MANAGER: Gestor institucional');
    console.log('   • ACADEMIC_COORDINATOR: Coordenador pedagógico');
    console.log('   • TEACHER: Professor');
    console.log('   • STUDENT: Aluno');
    console.log('   • GUARDIAN: Responsável');
    console.log('\n🔑 Usuários criados:');
    console.log('   👑 admin@portal.com / password123 (SYSTEM_ADMIN)');
    console.log('   🏢 gestor@sabercon.edu.br / password123');
    console.log('   📚 coordenador@sabercon.edu.br / password123');
    console.log('   👨‍🏫 professor@sabercon.edu.br / password123');
    console.log('   🎓 julia.costa@sabercon.edu.br / password123');
    console.log('   👨‍👩‍👧‍👦 responsavel@sabercon.edu.br / password123');
    console.log('\n🚀 Sistema pronto para uso!');

  } catch (error) {
    console.log('❌ Erro ao executar seeds:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 