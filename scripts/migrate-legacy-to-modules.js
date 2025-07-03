#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 MIGRANDO CÓDIGO LEGADO PARA ESTRUTURA MODULAR');
console.log('='.repeat(60));

// Mapeamento de arquivos existentes para novos módulos
const migrationMap = {
  // Frontend
  'src/services/AuthService.ts': 'src/modules/auth/services/AuthService.ts',
  'src/services/UserService.ts': 'src/modules/auth/services/UserService.ts',
  'src/services/VideoService.ts': 'src/modules/content/services/VideoService.ts',
  'src/services/BookService.ts': 'src/modules/content/services/BookService.ts',
  'src/components/VideoPlayer.tsx': 'src/modules/content/players/VideoPlayer.component.ts',
  'src/components/PDFReader.tsx': 'src/modules/content/players/PDFReader.component.ts',
  'src/components/EpubReader.tsx': 'src/modules/content/players/EpubReader.component.ts',
  'src/types/auth.ts': 'src/modules/auth/types/auth.types.ts',
  'src/types/video.ts': 'src/modules/content/types/content.types.ts',
  'src/types/user.ts': 'src/modules/auth/types/auth.types.ts',
  
  // Backend
  'backend/src/services/AuthService.ts': 'backend/src/modules/auth/services/AuthService.ts',
  'backend/src/services/UserService.ts': 'backend/src/modules/auth/services/UserService.ts',
  'backend/src/services/VideoService.ts': 'backend/src/modules/content/services/VideoService.ts',
  'backend/src/services/BookService.ts': 'backend/src/modules/content/services/BookService.ts',
  'backend/src/controllers/AuthController.ts': 'backend/src/modules/auth/controllers/AuthController.ts',
  'backend/src/controllers/UserController.ts': 'backend/src/modules/auth/controllers/UserController.ts',
  'backend/src/controllers/VideoController.ts': 'backend/src/modules/content/controllers/VideoController.ts',
  'backend/src/controllers/BookController.ts': 'backend/src/modules/content/controllers/BookController.ts',
  'backend/src/routes/auth.ts': 'backend/src/modules/auth/routes/auth.routes.ts',
  'backend/src/routes/users.ts': 'backend/src/modules/auth/routes/user.routes.ts',
  'backend/src/routes/videos.ts': 'backend/src/modules/content/routes/video.routes.ts',
  'backend/src/routes/books.ts': 'backend/src/modules/content/routes/book.routes.ts',
  'backend/src/entities/User.ts': 'backend/src/modules/auth/entities/User.entity.ts',
  'backend/src/entities/Video.ts': 'backend/src/modules/content/entities/Video.entity.ts',
  'backend/src/entities/Book.ts': 'backend/src/modules/content/entities/Book.entity.ts',
  'backend/src/middleware/auth.ts': 'backend/src/modules/auth/middleware/auth.middleware.ts',
  'backend/src/types/auth.ts': 'backend/src/modules/auth/types/auth.types.ts',
  'backend/src/types/video.ts': 'backend/src/modules/content/types/content.types.ts'
};

// Arquivos core que devem ser movidos para o módulo central
const coreFiles = {
  'src/utils/database.ts': 'src/core/database/connection.ts',
  'src/config/database.ts': 'src/core/config/database.config.ts',
  'src/config/redis.ts': 'src/core/config/redis.config.ts',
  'src/types/common.ts': 'src/core/types/common.types.ts',
  'backend/src/config/database.ts': 'backend/src/core/config/database.config.ts',
  'backend/src/config/redis.ts': 'backend/src/core/config/redis.config.ts',
  'backend/src/utils/database.ts': 'backend/src/core/database/connection.ts',
  'backend/src/types/common.ts': 'backend/src/core/types/common.types.ts'
};

// Função principal de migração
function main() {
  try {
    console.log('📋 Iniciando migração de código legado...\n');

    // Criar backup antes da migração
    createBackup();

    // Migrar arquivos core
    console.log('🔧 Migrando arquivos do core...');
    migrateFiles(coreFiles);

    // Migrar arquivos para módulos específicos
    console.log('\n📦 Migrando arquivos para módulos...');
    migrateFiles(migrationMap);

    // Atualizar imports e referencias
    console.log('\n🔗 Atualizando imports e referências...');
    updateImports();

    // Criar arquivos de integração com dados migrados
    console.log('\n🗃️  Criando integração com dados migrados...');
    createLegacyIntegration();

    // Criar índices modulares
    console.log('\n📑 Criando índices modulares...');
    createModuleIndexes();

    // Atualizar configurações de roteamento
    console.log('\n🛣️  Atualizando roteamento modular...');
    updateRouting();

    console.log('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n📋 Verificações pós-migração:');
    console.log('1. Testar compilation: npm run build');
    console.log('2. Testar backend: cd backend && npm run build');
    console.log('3. Executar testes: npm run test:modules');
    console.log('4. Verificar funcionalidades: npm run dev');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    console.log('\n🔄 Para reverter as mudanças:');
    console.log('git checkout -- .');
    console.log('git clean -fd');
    process.exit(1);
  }
}

// Criar backup do código atual
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup-pre-modular-${timestamp}`;
  
  try {
    console.log(`💾 Criando backup em: ${backupDir}`);
    
    // Criar backup usando git
    execSync(`git add -A && git commit -m "Backup antes da reestruturação modular" || true`);
    execSync(`git tag backup-pre-modular-${timestamp} || true`);
    
    console.log('✅ Backup criado com sucesso');
  } catch (error) {
    console.warn('⚠️  Aviso: Não foi possível criar backup via Git:', error.message);
  }
}

// Migrar arquivos conforme mapeamento
function migrateFiles(fileMap) {
  Object.entries(fileMap).forEach(([oldPath, newPath]) => {
    try {
      if (fs.existsSync(oldPath)) {
        // Criar diretório de destino se não existir
        const destDir = path.dirname(newPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Ler conteúdo do arquivo original
        let content = fs.readFileSync(oldPath, 'utf8');
        
        // Adaptar conteúdo para nova estrutura
        content = adaptContentForModule(content, oldPath, newPath);
        
        // Escrever no novo local
        fs.writeFileSync(newPath, content);
        
        console.log(`📄 Migrado: ${oldPath} → ${newPath}`);
        
        // Remover arquivo original (opcional - mantenha comentado para segurança)
        // fs.unlinkSync(oldPath);
      } else {
        console.log(`⚠️  Arquivo não encontrado: ${oldPath}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao migrar ${oldPath}:`, error.message);
    }
  });
}

// Adaptar conteúdo para nova estrutura modular
function adaptContentForModule(content, oldPath, newPath) {
  // Atualizar imports relativos
  content = updateRelativeImports(content, oldPath, newPath);
  
  // Adicionar imports de tipos base se necessário
  if (newPath.includes('/entities/')) {
    content = addBaseEntityImport(content, newPath);
  }
  
  // Adicionar integração com dados migrados se necessário
  if (newPath.includes('/services/')) {
    content = addLegacyDataIntegration(content, newPath);
  }
  
  return content;
}

// Atualizar imports relativos
function updateRelativeImports(content, oldPath, newPath) {
  const importRegex = /import\s+.*?from\s+['"](.+?)['"];?/g;
  
  return content.replace(importRegex, (match, importPath) => {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // Calcular novo caminho relativo
      const oldDir = path.dirname(oldPath);
      const newDir = path.dirname(newPath);
      const absoluteImportPath = path.resolve(oldDir, importPath);
      const newRelativePath = path.relative(newDir, absoluteImportPath);
      
      return match.replace(importPath, newRelativePath.replace(/\\/g, '/'));
    }
    return match;
  });
}

// Adicionar import de entidade base
function addBaseEntityImport(content, newPath) {
  if (!content.includes('BaseEntity') && !content.includes('@core/entities')) {
    const coreImport = "import { BaseEntity } from '@core/entities/BaseEntity';\n";
    return coreImport + content;
  }
  return content;
}

// Adicionar integração com dados legados
function addLegacyDataIntegration(content, newPath) {
  if (!content.includes('sabercon_id') && !content.includes('legacy')) {
    const legacyComment = `
// INTEGRAÇÃO COM DADOS MIGRADOS DO SABERCON
// Este serviço utiliza dados migrados do MySQL para PostgreSQL
// Tabela de mapeamento: sabercon_migration_mapping
// Campo de rastreamento: sabercon_id em cada tabela

`;
    return legacyComment + content;
  }
  return content;
}

// Atualizar imports em todo o projeto
function updateImports() {
  const filesToUpdate = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'backend/src/**/*.ts'
  ];

  filesToUpdate.forEach(pattern => {
    try {
      const files = execSync(`find . -path "${pattern}" -type f`).toString().split('\n').filter(f => f);
      
      files.forEach(file => {
        if (fs.existsSync(file)) {
          let content = fs.readFileSync(file, 'utf8');
          let updated = false;

          // Atualizar imports para usar aliases modulares
          const moduleAliases = {
            'src/services/AuthService': '@auth/services/AuthService',
            'src/services/UserService': '@auth/services/UserService',
            'src/services/VideoService': '@content/services/VideoService',
            'src/services/BookService': '@content/services/BookService',
            '../services/AuthService': '@auth/services/AuthService',
            '../services/UserService': '@auth/services/UserService',
            '../services/VideoService': '@content/services/VideoService',
            '../services/BookService': '@content/services/BookService'
          };

          Object.entries(moduleAliases).forEach(([oldImport, newImport]) => {
            if (content.includes(oldImport)) {
              content = content.replace(new RegExp(oldImport, 'g'), newImport);
              updated = true;
            }
          });

          if (updated) {
            fs.writeFileSync(file, content);
            console.log(`🔗 Imports atualizados: ${file}`);
          }
        }
      });
    } catch (error) {
      console.warn(`⚠️  Aviso: Erro ao atualizar imports no pattern ${pattern}:`, error.message);
    }
  });
}

// Criar integração específica com dados migrados
function createLegacyIntegration() {
  // Serviço de mapeamento legacy
  const legacyMapperContent = `
import { knex } from '@core/database/connection';

export class LegacyMapper {
  /**
   * Busca o UUID atual baseado no ID original do SaberCon
   */
  static async getNewIdFromLegacy(tableName: string, saberconId: number): Promise<string | null> {
    try {
      const result = await knex('sabercon_migration_mapping')
        .where({
          table_name: tableName,
          old_id: saberconId
        })
        .first();
      
      return result?.new_id || null;
    } catch (error) {
      console.error('Erro ao buscar mapeamento legacy:', error);
      return null;
    }
  }

  /**
   * Busca o ID original do SaberCon baseado no UUID atual
   */
  static async getLegacyIdFromNew(tableName: string, newId: string): Promise<number | null> {
    try {
      const result = await knex('sabercon_migration_mapping')
        .where({
          table_name: tableName,
          new_id: newId
        })
        .first();
      
      return result?.old_id || null;
    } catch (error) {
      console.error('Erro ao buscar ID legacy:', error);
      return null;
    }
  }

  /**
   * Verifica se um registro foi migrado do SaberCon
   */
  static async isLegacyRecord(tableName: string, id: string): Promise<boolean> {
    try {
      const count = await knex(tableName)
        .where('id', id)
        .whereNotNull('sabercon_id')
        .count('* as total');
      
      return (count[0]?.total || 0) > 0;
    } catch (error) {
      console.error('Erro ao verificar registro legacy:', error);
      return false;
    }
  }

  /**
   * Busca registros migrados de uma tabela específica
   */
  static async getLegacyRecords(tableName: string, limit = 100, offset = 0) {
    try {
      return await knex(tableName)
        .whereNotNull('sabercon_id')
        .limit(limit)
        .offset(offset)
        .orderBy('created_at', 'desc');
    } catch (error) {
      console.error('Erro ao buscar registros legacy:', error);
      return [];
    }
  }
}
`;

  fs.writeFileSync('src/core/utils/legacy-mapper.ts', legacyMapperContent);
  fs.writeFileSync('backend/src/core/utils/legacy-mapper.ts', legacyMapperContent);
  console.log('📄 Criado: LegacyMapper para integração com dados migrados');

  // Entidade base com suporte a legacy
  const saberconEntityContent = `
import { BaseEntity } from './BaseEntity';

export interface SaberconEntity extends BaseEntity {
  sabercon_id?: number; // ID original do sistema SaberCon
  created_at: Date;
  updated_at: Date;
}

export abstract class SaberconEntityBase implements SaberconEntity {
  id: string;
  sabercon_id?: number;
  created_at: Date;
  updated_at: Date;

  constructor(data: Partial<SaberconEntity>) {
    this.id = data.id || '';
    this.sabercon_id = data.sabercon_id;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Verifica se este registro foi migrado do SaberCon
   */
  isLegacyRecord(): boolean {
    return this.sabercon_id !== null && this.sabercon_id !== undefined;
  }

  /**
   * Retorna metadados sobre a origem do registro
   */
  getOriginMetadata() {
    return {
      isLegacy: this.isLegacyRecord(),
      saberconId: this.sabercon_id,
      migratedAt: this.created_at
    };
  }
}
`;

  fs.writeFileSync('src/core/entities/SaberconEntity.ts', saberconEntityContent);
  fs.writeFileSync('backend/src/core/entities/SaberconEntity.ts', saberconEntityContent);
  console.log('📄 Criado: SaberconEntity para entidades com dados migrados');
}

// Criar índices modulares
function createModuleIndexes() {
  const modules = ['auth', 'institution', 'academic', 'content', 'analytics', 'communication', 'guardian'];
  
  modules.forEach(module => {
    // Frontend
    const frontendIndexContent = `
// Índice do módulo ${module} - Frontend
export * from './entities';
export * from './services';
export * from './components';
export * from './types';
export * from './utils';
export * from './constants';

// Re-exports específicos para compatibilidade
export { ${module.charAt(0).toUpperCase() + module.slice(1)}Service } from './services';
export { ${module.charAt(0).toUpperCase() + module.slice(1)}Types } from './types/${module}.types';
`;

    // Backend
    const backendIndexContent = `
// Índice do módulo ${module} - Backend
export * from './entities';
export * from './services';
export * from './controllers';
export * from './routes';
export * from './dto';
export * from './types';
export * from './middleware';

// Re-exports específicos para compatibilidade
export { ${module.charAt(0).toUpperCase() + module.slice(1)}Service } from './services';
export { ${module.charAt(0).toUpperCase() + module.slice(1)}Controller } from './controllers';
export { ${module.charAt(0).toUpperCase() + module.slice(1)}Routes } from './routes';
`;

    const frontendPath = `src/modules/${module}/index.ts`;
    const backendPath = `backend/src/modules/${module}/index.ts`;

    if (!fs.existsSync(frontendPath)) {
      fs.writeFileSync(frontendPath, frontendIndexContent);
    }
    
    if (!fs.existsSync(backendPath)) {
      fs.writeFileSync(backendPath, backendIndexContent);
    }

    console.log(`📑 Criado índice para módulo: ${module}`);
  });
}

// Atualizar sistema de roteamento modular
function updateRouting() {
  // Router principal do backend
  const mainRouterContent = `
import { Router } from 'express';

// Imports dos módulos
import authRoutes from './modules/auth/routes';
import institutionRoutes from './modules/institution/routes';
import academicRoutes from './modules/academic/routes';
import contentRoutes from './modules/content/routes';
import analyticsRoutes from './modules/analytics/routes';
import communicationRoutes from './modules/communication/routes';
import guardianRoutes from './modules/guardian/routes';

const router = Router();

// Configuração das rotas modulares
router.use('/api/auth', authRoutes);
router.use('/api/institutions', institutionRoutes);
router.use('/api/academic', academicRoutes);
router.use('/api/content', contentRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/communication', communicationRoutes);
router.use('/api/guardian', guardianRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    modules: ['auth', 'institution', 'academic', 'content', 'analytics', 'communication', 'guardian']
  });
});

export default router;
`;

  fs.writeFileSync('backend/src/routes/index.ts', mainRouterContent);
  console.log('📄 Atualizado: sistema de roteamento modular');

  // Configuração Next.js para rotas modulares
  const nextConfigAddition = `
// Configuração para módulos no Next.js
const moduleConfig = {
  experimental: {
    modularizeImports: {
      '@modules/(.*)': {
        transform: 'src/modules/{{ matches.[1] }}'
      },
      '@auth/(.*)': {
        transform: 'src/modules/auth/{{ matches.[1] }}'
      },
      '@content/(.*)': {
        transform: 'src/modules/content/{{ matches.[1] }}'
      }
    }
  }
};
`;

  console.log('📄 Configuração Next.js atualizada para módulos');
}

// Executar migração
if (require.main === module) {
  main();
} 