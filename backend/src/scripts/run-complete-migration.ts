#!/usr/bin/env node

import { testDumpParser } from './test-dump-parser';
import { CompleteDumpMigration } from './migrate-dump-data';
import knex from '../config/database';

interface RunMigrationOptions {
  dumpPath?: string;
  dryRun?: boolean;
  testFirst?: boolean;
  batchSize?: number;
  skipTables?: string[];
}

class MigrationRunner {
  private options: RunMigrationOptions;

  constructor(options: RunMigrationOptions = {}) {
    this.options = {
      dumpPath: 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601',
      dryRun: false,
      testFirst: true,
      batchSize: 50,
      skipTables: [],
      ...options
    };
  }

  async checkPrerequisites(): Promise<boolean> {
    console.log('🔍 Verificando pré-requisitos...\n');

    try {
      // Verificar conexão com banco
      await knex.raw('SELECT 1');
      console.log('✅ Conexão com banco de dados OK');

      // Verificar se as migrações foram executadas
      const tables = await knex.raw(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('tv_shows', 'videos', 'authors', 'files', 'content_authors')
      `);

      const requiredTables = ['tv_shows', 'videos', 'authors', 'files', 'content_authors'];
      const existingTables = tables.rows.map((row: any) => row.table_name);
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));

      if (missingTables.length > 0) {
        console.log(`❌ Tabelas faltando: ${missingTables.join(', ')}`);
        console.log('Execute as migrações primeiro: npm run migrate');
        return false;
      }
      console.log('✅ Todas as tabelas necessárias existem');

      // Verificar se existe role padrão
      const defaultRole = await knex('roles').where('name', 'student').first();
      if (!defaultRole) {
        console.log('❌ Role padrão "student" não encontrada');
        console.log('Execute o setup primeiro: POST /api/setup');
        return false;
      }
      console.log('✅ Role padrão encontrada');

      // Verificar se o diretório do dump existe
      const fs = require('fs');
      if (!fs.existsSync(this.options.dumpPath)) {
        console.log(`❌ Diretório do dump não encontrado: ${this.options.dumpPath}`);
        return false;
      }
      console.log('✅ Diretório do dump encontrado');

      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar pré-requisitos:', error);
      return false;
    }
  }

  async runTest(): Promise<boolean> {
    console.log('\n🧪 EXECUTANDO TESTE DO PARSER...\n');
    
    try {
      await testDumpParser();
      console.log('\n✅ Teste do parser concluído com sucesso!');
      return true;
    } catch (error) {
      console.error('\n❌ Erro no teste do parser:', error);
      return false;
    }
  }

  async runMigration(): Promise<void> {
    console.log('\n🚀 INICIANDO MIGRAÇÃO COMPLETA...\n');

    const migration = new CompleteDumpMigration({
      dumpDirectory: this.options.dumpPath!,
      batchSize: this.options.batchSize,
      dryRun: this.options.dryRun,
      createDefaultInstitution: true
    });

    await migration.runFullMigration({
      dumpDirectory: this.options.dumpPath!
    });
  }

  async generateReport(): Promise<void> {
    console.log('\n📊 GERANDO RELATÓRIO PÓS-MIGRAÇÃO...\n');

    try {
      const stats = await Promise.all([
        knex('institutions').count('* as count').first(),
        knex('users').count('* as count').first(),
        knex('authors').count('* as count').first(),
        knex('files').count('* as count').first(),
        knex('videos').count('* as count').first(),
        knex('tv_shows').count('* as count').first(),
        knex('content_authors').count('* as count').first(),
        knex('video_files').count('* as count').first(),
        knex('tv_show_videos').count('* as count').first()
      ]);

      console.log(`📋 RELATÓRIO FINAL:
        🏛️ Instituições: ${stats[0]?.count || 0}
        👥 Usuários: ${stats[1]?.count || 0}
        ✍️ Autores: ${stats[2]?.count || 0}
        📁 Arquivos: ${stats[3]?.count || 0}
        🎬 Vídeos: ${stats[4]?.count || 0}
        📺 TV Shows: ${stats[5]?.count || 0}
        🔗 Relacionamentos Autor-Conteúdo: ${stats[6]?.count || 0}
        🔗 Relacionamentos Vídeo-Arquivo: ${stats[7]?.count || 0}
        🔗 Relacionamentos TV Show-Vídeo: ${stats[8]?.count || 0}
      `);

      // Verificar integridade
      console.log('\n🔍 VERIFICAÇÕES DE INTEGRIDADE:');

      const orphanVideos = await knex('videos')
        .leftJoin('video_files', 'videos.id', 'video_files.video_id')
        .whereNull('video_files.video_id')
        .count('* as count')
        .first();

      console.log(`📊 Vídeos sem arquivos: ${orphanVideos?.count || 0}`);

      const tvShowsWithoutEpisodes = await knex('tv_shows')
        .leftJoin('tv_show_videos', 'tv_shows.id', 'tv_show_videos.tv_show_id')
        .whereNull('tv_show_videos.tv_show_id')
        .count('* as count')
        .first();

      console.log(`📊 TV Shows sem episódios: ${tvShowsWithoutEpisodes?.count || 0}`);

      const authorsWithoutContent = await knex('authors')
        .leftJoin('content_authors', 'authors.id', 'content_authors.author_id')
        .whereNull('content_authors.author_id')
        .count('* as count')
        .first();

      console.log(`📊 Autores sem conteúdo: ${authorsWithoutContent?.count || 0}`);

    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
    }
  }

  async run(): Promise<void> {
    console.log('🎯 MIGRAÇÃO COMPLETA DO DUMP SABERCON\n');
    console.log(`Configurações:
      📂 Diretório: ${this.options.dumpPath}
      🔍 Dry Run: ${this.options.dryRun ? 'SIM' : 'NÃO'}
      🧪 Testar primeiro: ${this.options.testFirst ? 'SIM' : 'NÃO'}
      📦 Tamanho do lote: ${this.options.batchSize}
    \n`);

    try {
      // 1. Verificar pré-requisitos
      const prerequisitesOk = await this.checkPrerequisites();
      if (!prerequisitesOk) {
        console.log('\n❌ Pré-requisitos não atendidos. Abortando migração.');
        process.exit(1);
      }

      // 2. Executar teste se solicitado
      if (this.options.testFirst) {
        const testOk = await this.runTest();
        if (!testOk) {
          console.log('\n❌ Teste falhou. Abortando migração.');
          process.exit(1);
        }

        // Perguntar se deve continuar
        if (!this.options.dryRun) {
          const readline = require('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

          const answer = await new Promise<string>((resolve) => {
            rl.question('\n❓ Continuar com a migração? (y/N): ', (answer: string) => {
              rl.close();
              resolve(answer);
            });
          });

          if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('🛑 Migração cancelada pelo usuário.');
            process.exit(0);
          }
        }
      }

      // 3. Executar migração
      await this.runMigration();

      // 4. Gerar relatório se não for dry run
      if (!this.options.dryRun) {
        await this.generateReport();
      }

      console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');

    } catch (error) {
      console.error('\n❌ ERRO DURANTE A MIGRAÇÃO:', error);
      process.exit(1);
    } finally {
      await knex.destroy();
    }
  }
}

// Script executável com argumentos da linha de comando
async function main() {
  const args = process.argv.slice(2);
  const options: RunMigrationOptions = {};

  // Parse de argumentos
  args.forEach((arg, index) => {
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-test':
        options.testFirst = false;
        break;
      case '--dump-path':
        options.dumpPath = args[index + 1];
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[index + 1]) || 50;
        break;
      case '--help':
        console.log(`
Uso: npm run migrate:dump [opções]

Opções:
  --dry-run              Executar sem modificar o banco (apenas teste)
  --no-test              Pular o teste inicial do parser
  --dump-path <path>     Caminho para o diretório do dump
  --batch-size <num>     Tamanho do lote para inserções (padrão: 50)
  --help                 Mostrar esta ajuda

Exemplos:
  npm run migrate:dump                                    # Migração completa
  npm run migrate:dump -- --dry-run                      # Apenas teste
  npm run migrate:dump -- --dump-path "/path/to/dump"    # Caminho customizado
        `);
        process.exit(0);
    }
  });

  const runner = new MigrationRunner(options);
  await runner.run();
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { MigrationRunner }; 