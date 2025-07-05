// Script para gerar relatório de migração baseado na estrutura do projeto
const fs = require('fs');
const path = require('path');

// Mapeamentos conhecidos baseados na estrutura do projeto
const knownTables = {
  // Sistema de usuários
  'users': { mysql: 'usuarios', postgres: 'users', priority: 'high', category: 'auth' },
  'institutions': { mysql: 'instituicoes', postgres: 'institutions', priority: 'high', category: 'auth' },
  'roles': { mysql: 'roles', postgres: 'roles', priority: 'high', category: 'auth' },
  'permissions': { mysql: 'permissions', postgres: 'permissions', priority: 'high', category: 'auth' },
  'user_roles': { mysql: 'user_roles', postgres: 'user_roles', priority: 'high', category: 'auth' },
  'sessions': { mysql: 'sessions', postgres: 'sessions', priority: 'medium', category: 'auth' },
  'push_subscriptions': { mysql: 'push_subscriptions', postgres: 'push_subscriptions', priority: 'low', category: 'auth' },

  // Sistema educacional
  'courses': { mysql: 'cursos', postgres: 'courses', priority: 'high', category: 'education' },
  'classes': { mysql: 'turmas', postgres: 'classes', priority: 'high', category: 'education' },
  'modules': { mysql: 'modulos', postgres: 'modules', priority: 'medium', category: 'education' },
  'lessons': { mysql: 'aulas', postgres: 'lessons', priority: 'medium', category: 'education' },
  'assignments': { mysql: 'atividades', postgres: 'assignments', priority: 'medium', category: 'education' },
  'assignment_submissions': { mysql: 'assignment_submissions', postgres: 'assignment_submissions', priority: 'medium', category: 'education' },

  // Conteúdo
  'books': { mysql: 'livros', postgres: 'books', priority: 'medium', category: 'content' },
  'files': { mysql: 'files', postgres: 'files', priority: 'medium', category: 'content' },
  'collections': { mysql: 'collections', postgres: 'collections', priority: 'low', category: 'content' },
  'content_collections': { mysql: 'content_collections', postgres: 'content_collections', priority: 'low', category: 'content' },
  'video_collections': { mysql: 'video_collections', postgres: 'video_collections', priority: 'low', category: 'content' },
  'videos': { mysql: 'videos', postgres: 'videos', priority: 'low', category: 'content' },

  // Avaliação
  'quizzes': { mysql: 'quizzes', postgres: 'quizzes', priority: 'medium', category: 'assessment' },
  'quiz_questions': { mysql: 'quiz_questions', postgres: 'quiz_questions', priority: 'medium', category: 'assessment' },
  'quiz_answers': { mysql: 'quiz_answers', postgres: 'quiz_answers', priority: 'medium', category: 'assessment' },
  'quiz_submissions': { mysql: 'quiz_submissions', postgres: 'quiz_submissions', priority: 'medium', category: 'assessment' },
  'quiz_results': { mysql: 'quiz_results', postgres: 'quiz_results', priority: 'medium', category: 'assessment' },
  'answers': { mysql: 'answer', postgres: 'answers', priority: 'medium', category: 'assessment' },
  'questions': { mysql: 'questions', postgres: 'questions', priority: 'medium', category: 'assessment' },

  // Comunicação
  'chats': { mysql: 'chats', postgres: 'chats', priority: 'medium', category: 'communication' },
  'chat_messages': { mysql: 'chat_messages', postgres: 'chat_messages', priority: 'medium', category: 'communication' },
  'forums': { mysql: 'forums', postgres: 'forums', priority: 'low', category: 'communication' },
  'forum_topics': { mysql: 'forum_topics', postgres: 'forum_topics', priority: 'low', category: 'communication' },
  'forum_posts': { mysql: 'forum_posts', postgres: 'forum_posts', priority: 'low', category: 'communication' },
  'announcements': { mysql: 'announcements', postgres: 'announcements', priority: 'medium', category: 'communication' },
  'notifications': { mysql: 'notifications', postgres: 'notifications', priority: 'medium', category: 'communication' },

  // Analytics e logs
  'analytics_sessions': { mysql: 'analytics_sessions', postgres: 'analytics_sessions', priority: 'low', category: 'analytics' },
  'attendance_records': { mysql: 'attendance_records', postgres: 'attendance_records', priority: 'medium', category: 'analytics' },
  'audit_logs': { mysql: 'audit_logs', postgres: 'audit_logs', priority: 'low', category: 'analytics' },
  'aws_connection_logs': { mysql: 'aws_connection_logs', postgres: 'aws_connection_logs', priority: 'low', category: 'analytics' },

  // Configurações
  'aws_settings': { mysql: 'aws_settings', postgres: 'aws_settings', priority: 'high', category: 'config' },
  'system_settings': { mysql: 'system_settings', postgres: 'system_settings', priority: 'high', category: 'config' }
};

// Tipos problemáticos conhecidos
const problematicTypes = {
  'tinyint(1)': { 
    postgres: 'boolean', 
    issue: 'MySQL boolean → PostgreSQL boolean',
    severity: 'warning',
    solution: 'Conversão automática 0/1 → false/true'
  },
  'enum': { 
    postgres: 'text + constraint', 
    issue: 'ENUM requer CHECK CONSTRAINT',
    severity: 'warning',
    solution: 'Criar constraint CHECK após migração'
  },
  'set': { 
    postgres: 'text + constraint', 
    issue: 'SET requer CHECK CONSTRAINT',
    severity: 'warning',
    solution: 'Criar constraint CHECK para valores múltiplos'
  },
  'json': { 
    postgres: 'jsonb', 
    issue: 'JSON → JSONB (mais eficiente)',
    severity: 'info',
    solution: 'Conversão automática para JSONB'
  },
  'longtext': { 
    postgres: 'text', 
    issue: 'LONGTEXT → TEXT',
    severity: 'info',
    solution: 'Conversão direta'
  },
  'longblob': { 
    postgres: 'bytea', 
    issue: 'LONGBLOB → BYTEA',
    severity: 'info',
    solution: 'Conversão de dados binários'
  },
  'datetime': { 
    postgres: 'timestamp without time zone', 
    issue: 'DATETIME → TIMESTAMP',
    severity: 'info',
    solution: 'Conversão automática, validar datas inválidas'
  }
};

// Campos problemáticos conhecidos por tabela
const knownProblematicFields = {
  'users': ['is_active', 'profile_data', 'preferences'],
  'answers': ['is_correct', 'metadata'],
  'quiz_questions': ['question_type', 'difficulty', 'is_active'],
  'assignments': ['status', 'type', 'is_active'],
  'files': ['file_data', 'metadata', 'is_public'],
  'notifications': ['type', 'status', 'data'],
  'quiz_submissions': ['answers_data', 'is_completed'],
  'analytics_sessions': ['session_data', 'is_active'],
  'aws_settings': ['configuration', 'is_enabled']
};

function generateMigrationReport() {
  console.log('📋 RELATÓRIO DE MIGRAÇÃO MYSQL → POSTGRESQL');
  console.log('=' .repeat(70));
  console.log(`Gerado em: ${new Date().toLocaleString('pt-BR')}\n`);

  // 1. Resumo Geral
  console.log('📊 RESUMO GERAL');
  console.log('-' .repeat(50));
  
  const totalTables = Object.keys(knownTables).length;
  const highPriority = Object.values(knownTables).filter(t => t.priority === 'high').length;
  const mediumPriority = Object.values(knownTables).filter(t => t.priority === 'medium').length;
  const lowPriority = Object.values(knownTables).filter(t => t.priority === 'low').length;

  console.log(`Total de tabelas identificadas: ${totalTables}`);
  console.log(`Prioridade alta: ${highPriority} tabelas`);
  console.log(`Prioridade média: ${mediumPriority} tabelas`);
  console.log(`Prioridade baixa: ${lowPriority} tabelas\n`);

  // 2. Mapeamento por Categoria
  console.log('🗂️ MAPEAMENTO POR CATEGORIA');
  console.log('-' .repeat(50));

  const categories = {};
  Object.entries(knownTables).forEach(([key, table]) => {
    if (!categories[table.category]) {
      categories[table.category] = [];
    }
    categories[table.category].push({ key, ...table });
  });

  Object.entries(categories).forEach(([category, tables]) => {
    const categoryNames = {
      'auth': '🔐 Autenticação e Usuários',
      'education': '📚 Sistema Educacional', 
      'content': '📁 Conteúdo e Mídia',
      'assessment': '📝 Avaliação e Quizzes',
      'communication': '💬 Comunicação',
      'analytics': '📊 Analytics e Logs',
      'config': '⚙️ Configurações'
    };

    console.log(`\n${categoryNames[category] || category}:`);
    tables.forEach(table => {
      const priority = table.priority === 'high' ? '🔴' : 
                      table.priority === 'medium' ? '🟡' : '🟢';
      console.log(`  ${priority} ${table.mysql.padEnd(25)} → ${table.postgres}`);
    });
  });

  // 3. Problemas Identificados
  console.log('\n\n⚠️ PROBLEMAS DE COMPATIBILIDADE IDENTIFICADOS');
  console.log('-' .repeat(50));

  Object.entries(problematicTypes).forEach(([mysqlType, info]) => {
    const severity = info.severity === 'warning' ? '⚠️' : 
                    info.severity === 'error' ? '❌' : 'ℹ️';
    console.log(`\n${severity} ${mysqlType.toUpperCase()}`);
    console.log(`   PostgreSQL: ${info.postgres}`);
    console.log(`   Problema: ${info.issue}`);
    console.log(`   Solução: ${info.solution}`);
  });

  // 4. Tabelas com Campos Problemáticos
  console.log('\n\n🎯 TABELAS COM CAMPOS PROBLEMÁTICOS');
  console.log('-' .repeat(50));

  Object.entries(knownProblematicFields).forEach(([tableName, fields]) => {
    const table = knownTables[tableName];
    if (table) {
      console.log(`\n📋 ${table.mysql} → ${table.postgres}`);
      fields.forEach(field => {
        console.log(`   ⚠️ ${field} - Requer atenção especial`);
      });
    }
  });

  // 5. Estratégia de Migração Recomendada
  console.log('\n\n🛠️ ESTRATÉGIA DE MIGRAÇÃO RECOMENDADA');
  console.log('-' .repeat(50));

  console.log('\n🔴 FASE 1 - Tabelas Críticas (Prioridade Alta):');
  Object.entries(knownTables)
    .filter(([_, table]) => table.priority === 'high')
    .forEach(([key, table]) => {
      console.log(`   ✅ ${table.mysql} → ${table.postgres}`);
    });
  console.log('   💡 Recomendação: Usar DROP CASCADE para garantir consistência');

  console.log('\n🟡 FASE 2 - Tabelas Principais (Prioridade Média):');
  Object.entries(knownTables)
    .filter(([_, table]) => table.priority === 'medium')
    .forEach(([key, table]) => {
      console.log(`   ✅ ${table.mysql} → ${table.postgres}`);
    });
  console.log('   💡 Recomendação: Migração incremental com validação');

  console.log('\n🟢 FASE 3 - Tabelas Secundárias (Prioridade Baixa):');
  Object.entries(knownTables)
    .filter(([_, table]) => table.priority === 'low')
    .forEach(([key, table]) => {
      console.log(`   ✅ ${table.mysql} → ${table.postgres}`);
    });
  console.log('   💡 Recomendação: Migração em lote com monitoramento');

  // 6. Checklist de Execução
  console.log('\n\n📋 CHECKLIST DE EXECUÇÃO');
  console.log('-' .repeat(50));

  console.log('\n✅ ANTES DA MIGRAÇÃO:');
  console.log('   [ ] Fazer backup completo do PostgreSQL');
  console.log('   [ ] Verificar conectividade MySQL e PostgreSQL');
  console.log('   [ ] Confirmar credenciais de acesso');
  console.log('   [ ] Verificar espaço em disco disponível');
  console.log('   [ ] Testar migração em ambiente de desenvolvimento');

  console.log('\n✅ DURANTE A MIGRAÇÃO:');
  console.log('   [ ] Usar interface de migração MySQL → PostgreSQL');
  console.log('   [ ] Selecionar opção "🔥 Recriar Tabelas (DROP CASCADE)"');
  console.log('   [ ] Monitorar logs em tempo real');
  console.log('   [ ] Anotar erros ou avisos importantes');
  console.log('   [ ] Verificar progresso por tabela');

  console.log('\n✅ APÓS A MIGRAÇÃO:');
  console.log('   [ ] Validar contagem de registros por tabela');
  console.log('   [ ] Testar queries principais do sistema');
  console.log('   [ ] Verificar constraints e índices criados');
  console.log('   [ ] Executar testes de integridade');
  console.log('   [ ] Documentar problemas encontrados');

  // 7. Comandos de Validação
  console.log('\n\n🔍 COMANDOS DE VALIDAÇÃO PÓS-MIGRAÇÃO');
  console.log('-' .repeat(50));

  console.log('\n-- Verificar contagem de registros:');
  Object.entries(knownTables).slice(0, 5).forEach(([key, table]) => {
    console.log(`SELECT COUNT(*) as ${table.postgres}_count FROM ${table.postgres};`);
  });

  console.log('\n-- Verificar tipos boolean:');
  console.log('SELECT is_active, COUNT(*) FROM users GROUP BY is_active;');
  console.log('SELECT is_correct, COUNT(*) FROM answers GROUP BY is_correct;');

  console.log('\n-- Verificar campos JSON:');
  console.log('SELECT metadata FROM answers WHERE metadata IS NOT NULL LIMIT 5;');
  console.log('SELECT configuration FROM aws_settings LIMIT 3;');

  console.log('\n-- Verificar constraints:');
  console.log(`SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
ORDER BY table_name, constraint_type;`);

  console.log('\n\n✅ RELATÓRIO GERADO COM SUCESSO!');
  console.log(`📊 ${totalTables} tabelas analisadas`);
  console.log('📋 Use este relatório como guia para a migração');
  console.log('🔧 Interface de migração disponível em: /admin/migration/mysql-postgres');
}

// Executar geração do relatório
if (require.main === module) {
  generateMigrationReport();
}

module.exports = { generateMigrationReport, knownTables, problematicTypes }; 