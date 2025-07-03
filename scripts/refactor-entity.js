#!/usr/bin/env node

/**
 * Script para auxiliar na refatoração de entidades para a nova estrutura PostgreSQL
 * 
 * Uso: node scripts/refactor-entity.js <entity-name> <table-name>
 * Exemplo: node scripts/refactor-entity.js TvShow tv_shows
 */

const fs = require('fs');
const path = require('path');

function generateEntityInterface(entityName, tableName, fields) {
  return `// Entidade ${entityName} refatorada para PostgreSQL
export interface ${entityName} {
  id: number;
  version?: number;
${fields.map(field => `  ${field.name}${field.nullable ? '?' : ''}: ${field.type};`).join('\n')}
  created_at: Date;
  updated_at: Date;
}

export interface Create${entityName}Data {
${fields.filter(f => f.name !== 'id').map(field => `  ${field.name}${field.nullable ? '?' : ''}: ${field.type};`).join('\n')}
}

export interface Update${entityName}Data {
${fields.filter(f => f.name !== 'id').map(field => `  ${field.name}?: ${field.type};`).join('\n')}
}

export interface ${entityName}WithRelations extends ${entityName} {
  // Adicionar relacionamentos aqui conforme necessário
}`;
}

function generateRepository(entityName, tableName) {
  const lowerEntityName = entityName.toLowerCase();
  
  return `import db from '../config/database';
import { ${entityName}, Create${entityName}Data, Update${entityName}Data, ${entityName}WithRelations } from '../entities/${entityName}';

export class ${entityName}Repository {
  private static readonly TABLE_NAME = '${tableName}';

  static async findById(id: number): Promise<${entityName}WithRelations | null> {
    try {
      const ${lowerEntityName} = await db(this.TABLE_NAME)
        .where('id', id)
        .first();

      if (!${lowerEntityName}) return null;

      return this.map${entityName}WithRelations(${lowerEntityName});
    } catch (error) {
      console.error('Erro ao buscar ${lowerEntityName} por ID:', error);
      throw error;
    }
  }

  static async create(${lowerEntityName}Data: Create${entityName}Data): Promise<${entityName}> {
    try {
      const [${lowerEntityName}] = await db(this.TABLE_NAME)
        .insert({
          ...${lowerEntityName}Data,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      return ${lowerEntityName};
    } catch (error) {
      console.error('Erro ao criar ${lowerEntityName}:', error);
      throw error;
    }
  }

  static async update(id: number, ${lowerEntityName}Data: Update${entityName}Data): Promise<${entityName} | null> {
    try {
      const [${lowerEntityName}] = await db(this.TABLE_NAME)
        .where('id', id)
        .update({
          ...${lowerEntityName}Data,
          updated_at: new Date()
        })
        .returning('*');

      return ${lowerEntityName} || null;
    } catch (error) {
      console.error('Erro ao atualizar ${lowerEntityName}:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const deletedRows = await db(this.TABLE_NAME)
        .where('id', id)
        .del();

      return deletedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar ${lowerEntityName}:', error);
      throw error;
    }
  }

  static async findAll(limit?: number, offset?: number): Promise<${entityName}WithRelations[]> {
    try {
      let query = db(this.TABLE_NAME)
        .orderBy('created_at', 'desc');

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const ${lowerEntityName}s = await query;
      return ${lowerEntityName}s.map(${lowerEntityName} => this.map${entityName}WithRelations(${lowerEntityName}));
    } catch (error) {
      console.error('Erro ao buscar todos os ${lowerEntityName}s:', error);
      throw error;
    }
  }

  static async count(): Promise<number> {
    try {
      const result = await db(this.TABLE_NAME).count('id as total').first();
      return parseInt(result?.total as string) || 0;
    } catch (error) {
      console.error('Erro ao contar ${lowerEntityName}s:', error);
      throw error;
    }
  }

  private static map${entityName}WithRelations(row: any): ${entityName}WithRelations {
    return {
      id: row.id,
      version: row.version,
      // Mapear todos os campos aqui
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }
}`;
}

function generateController(entityName) {
  const lowerEntityName = entityName.toLowerCase();
  const pluralEntityName = entityName.toLowerCase() + 's';
  
  return `import { Request, Response, NextFunction } from 'express';
import { ${entityName}Repository } from '../repositories/${entityName}Repository';
import { Create${entityName}Data, Update${entityName}Data } from '../entities/${entityName}';

export class ${entityName}Controller {
  static async get${entityName}s(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset } = req.query;
      
      const ${pluralEntityName} = await ${entityName}Repository.findAll(
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );

      return res.json({
        success: true,
        data: ${pluralEntityName},
        total: ${pluralEntityName}.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar ${pluralEntityName}',
        error: error.message
      });
    }
  }

  static async get${entityName}ById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ${lowerEntityName}Id = parseInt(id);

      if (isNaN(${lowerEntityName}Id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do ${lowerEntityName} inválido'
        });
      }

      const ${lowerEntityName} = await ${entityName}Repository.findById(${lowerEntityName}Id);

      if (!${lowerEntityName}) {
        return res.status(404).json({
          success: false,
          message: '${entityName} não encontrado'
        });
      }

      return res.json({
        success: true,
        data: ${lowerEntityName}
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar ${lowerEntityName}',
        error: error.message
      });
    }
  }

  static async create${entityName}(req: Request, res: Response, next: NextFunction) {
    try {
      const ${lowerEntityName}Data: Create${entityName}Data = req.body;

      const ${lowerEntityName} = await ${entityName}Repository.create(${lowerEntityName}Data);

      return res.status(201).json({
        success: true,
        data: ${lowerEntityName},
        message: '${entityName} criado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar ${lowerEntityName}',
        error: error.message
      });
    }
  }

  static async update${entityName}(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ${lowerEntityName}Id = parseInt(id);
      const ${lowerEntityName}Data: Update${entityName}Data = req.body;

      if (isNaN(${lowerEntityName}Id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do ${lowerEntityName} inválido'
        });
      }

      const ${lowerEntityName} = await ${entityName}Repository.update(${lowerEntityName}Id, ${lowerEntityName}Data);

      if (!${lowerEntityName}) {
        return res.status(404).json({
          success: false,
          message: '${entityName} não encontrado'
        });
      }

      return res.json({
        success: true,
        data: ${lowerEntityName},
        message: '${entityName} atualizado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar ${lowerEntityName}',
        error: error.message
      });
    }
  }

  static async delete${entityName}(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ${lowerEntityName}Id = parseInt(id);

      if (isNaN(${lowerEntityName}Id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do ${lowerEntityName} inválido'
        });
      }

      const deleted = await ${entityName}Repository.delete(${lowerEntityName}Id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: '${entityName} não encontrado'
        });
      }

      return res.json({
        success: true,
        message: '${entityName} deletado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar ${lowerEntityName}',
        error: error.message
      });
    }
  }
}`;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Uso: node scripts/refactor-entity.js <EntityName> <table_name>');
    console.log('Exemplo: node scripts/refactor-entity.js TvShow tv_shows');
    process.exit(1);
  }

  const [entityName, tableName] = args;
  
  console.log(`🚀 Refatorando entidade: ${entityName} (tabela: ${tableName})`);

  // Criar diretórios se não existirem
  const dirs = [
    'backend/src/entities',
    'backend/src/repositories',
    'backend/src/controllers'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Gerar arquivos
  const files = [
    {
      path: `backend/src/entities/${entityName}.ts`,
      content: generateEntityInterface(entityName, tableName, [
        // Campos básicos - você deve ajustar conforme a migração
        { name: 'name', type: 'string', nullable: false },
        { name: 'description', type: 'string', nullable: true }
      ])
    },
    {
      path: `backend/src/repositories/${entityName}Repository.ts`,
      content: generateRepository(entityName, tableName)
    },
    {
      path: `backend/src/controllers/${entityName}Controller.ts`,
      content: generateController(entityName)
    }
  ];

  files.forEach(file => {
    fs.writeFileSync(file.path, file.content);
    console.log(`✅ Criado: ${file.path}`);
  });

  console.log(`
🎉 Refatoração básica concluída para ${entityName}!

📝 Próximos passos:
1. Verificar a migração em backend/migrations/*${tableName}*
2. Ajustar os campos na interface ${entityName}
3. Completar o mapeamento no repository
4. Criar as rotas em backend/src/routes/
5. Criar os DTOs em backend/src/dto/
6. Testar os endpoints

📖 Consulte o GUIA_REFATORACAO_COMPLETA.md para mais detalhes.
  `);
}

if (require.main === module) {
  main();
} 