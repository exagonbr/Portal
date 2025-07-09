/**
 * Script para corrigir erros nos repositórios
 * 
 * Este script pode ser usado para corrigir erros comuns nos repositórios:
 * 
 * 1. Criar a interface ExtendedRepository
 * 2. Modificar os repositórios para estender ExtendedRepository
 * 3. Implementar o método findAllPaginated
 * 4. Modificar os controllers para usar findAllPaginated
 * 
 * Como usar:
 * 1. Certifique-se de que o arquivo ExtendedRepository.ts foi criado
 * 2. Execute: node scripts/fix-repository-errors.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretórios
const REPOSITORIES_DIR = path.join(__dirname, '../src/repositories');
const CONTROLLERS_DIR = path.join(__dirname, '../src/controllers');
const ENTITIES_DIR = path.join(__dirname, '../src/entities');

// Verificar se ExtendedRepository existe
const extendedRepoPath = path.join(REPOSITORIES_DIR, 'ExtendedRepository.ts');
if (!fs.existsSync(extendedRepoPath)) {
  console.error('ExtendedRepository.ts não encontrado. Por favor, crie este arquivo primeiro.');
  process.exit(1);
}

// Obter todos os arquivos de repositório
const repositoryFiles = fs.readdirSync(REPOSITORIES_DIR)
  .filter(file => file.endsWith('Repository.ts') && file !== 'BaseRepository.ts' && file !== 'ExtendedRepository.ts');

console.log(`Encontrados ${repositoryFiles.length} arquivos de repositório para processar.`);

// Processar cada repositório
repositoryFiles.forEach(file => {
  console.log(`Processando ${file}...`);
  
  const filePath = path.join(REPOSITORIES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extrair o nome da entidade do nome do arquivo
  const entityName = file.replace('Repository.ts', '');
  
  // Verificar se a entidade existe
  const entityFile = path.join(ENTITIES_DIR, `${entityName}.ts`);
  if (!fs.existsSync(entityFile)) {
    console.warn(`Aviso: Arquivo de entidade ${entityName}.ts não encontrado.`);
  }
  
  // Substituir importações
  content = content.replace(
    /import\s*{[\s\w,]*BaseRepository[\s\w,]*}\s*from\s*['"]\.\/BaseRepository['"]/,
    `import { ExtendedRepository, PaginatedResult } from './ExtendedRepository'`
  );
  
  // Substituir a classe base
  content = content.replace(
    new RegExp(`extends\\s+BaseRepository<${entityName}>`, 'g'),
    `extends ExtendedRepository<${entityName}>`
  );
  
  // Adicionar importação de DeleteResult se não existir
  if (content.includes('delete(id:') && !content.includes('DeleteResult')) {
    content = content.replace(
      /import\s*{[\s\w,]*Repository[\s\w,]*}\s*from\s*['"]typeorm['"]/,
      `import { Repository, DeleteResult } from 'typeorm'`
    );
  }
  
  // Corrigir o método delete para lidar com result.affected possivelmente nulo
  content = content.replace(
    /return result\.affected !== undefined && result\.affected > 0/g,
    `return result.affected ? result.affected > 0 : false`
  );
  
  // Verificar se já tem findAllPaginated
  if (!content.includes('findAllPaginated')) {
    // Adicionar findAllPaginated
    const findAllPaginatedMethod = `
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<${entityName}>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('${entityName.toLowerCase()}');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('${entityName.toLowerCase()}.name ILIKE :search', { search: \`%\${search}%\` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('${entityName.toLowerCase()}.id', 'DESC')
          .getManyAndCount();
          
        return {
          data,
          total,
          page,
          limit
        };
      } else {
        // Fallback para query raw
        const query = \`
          SELECT * FROM ${entityName.toLowerCase()}
          \${search ? \`WHERE name ILIKE '%\${search}%'\` : ''}
          ORDER BY id DESC
          LIMIT \${limit} OFFSET \${(page - 1) * limit}
        \`;
        
        const countQuery = \`
          SELECT COUNT(*) as total FROM ${entityName.toLowerCase()}
          \${search ? \`WHERE name ILIKE '%\${search}%'\` : ''}
        \`;

        const [data, countResult] = await Promise.all([
          AppDataSource.query(query),
          AppDataSource.query(countQuery)
        ]);

        const total = parseInt(countResult[0].total);

        return {
          data,
          total,
          page,
          limit
        };
      }
    } catch (error) {
      console.error(\`Erro ao buscar registros de ${entityName.toLowerCase()}:\`, error);
      throw error;
    }
  }`;
    
    // Inserir após o construtor
    const constructorEndIndex = content.indexOf('constructor(') + content.substring(content.indexOf('constructor(')).indexOf('}') + 1;
    content = content.substring(0, constructorEndIndex) + findAllPaginatedMethod + content.substring(constructorEndIndex);
  }
  
  // Salvar o arquivo modificado
  fs.writeFileSync(filePath, content);
  console.log(`✓ Repositório ${file} atualizado.`);
  
  // Agora, atualizar o controller correspondente
  const controllerFile = path.join(CONTROLLERS_DIR, `${entityName}Controller.ts`);
  if (fs.existsSync(controllerFile)) {
    let controllerContent = fs.readFileSync(controllerFile, 'utf8');
    
    // Substituir chamadas de findAll para findAllPaginated
    if (controllerContent.includes('.findAll(') && !controllerContent.includes('.findAllPaginated(')) {
      controllerContent = controllerContent.replace(
        /\.findAll\(\s*{\s*page\s*,\s*limit\s*,\s*search\s*}\s*\)/g,
        '.findAllPaginated({ page, limit, search })'
      );
      
      fs.writeFileSync(controllerFile, controllerContent);
      console.log(`✓ Controller ${entityName}Controller.ts atualizado para usar findAllPaginated.`);
    }
  } else {
    console.warn(`Aviso: Controller ${entityName}Controller.ts não encontrado.`);
  }
});

console.log('\nProcesso concluído. Verifique se há erros de compilação executando:');
console.log('npx tsc --noEmit'); 