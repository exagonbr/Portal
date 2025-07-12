const fs = require('fs');
const path = require('path');

// Adiciona tipos faltantes ao common.ts
function addMissingTypesToCommon() {
  const commonPath = path.join(__dirname, 'src/types/common.ts');
  let content = fs.readFileSync(commonPath, 'utf8');
  
  // Adiciona interfaces faltantes antes do fechamento do arquivo
  const additionalTypes = `
// ===== TIPOS DE PAGINAÇÃO =====

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterOptions {
  search?: string;
  isActive?: boolean;
  deleted?: boolean;
  [key: string]: any;
}
`;

  // Adiciona antes do final do arquivo
  if (!content.includes('PaginationParams')) {
    content = content + '\n' + additionalTypes;
    fs.writeFileSync(commonPath, content, 'utf8');
    console.log('✓ Added missing types to common.ts');
  }
}

// Corrige problemas nos DTOs
function fixDtoIssues() {
  const dtoDir = path.join(__dirname, 'src/dto');
  
  // Lista de DTOs que precisam de correções
  const dtosToFix = {
    'CreateVideoDto.ts': {
      find: 'version?: string;',
      replace: 'version?: number;'
    },
    'UpdateVideoDto.ts': {
      find: 'version?: string;',
      replace: 'version?: number;'
    },
    'CreateUnitDto.ts': {
      find: 'version?: string;',
      replace: 'version?: number;'
    },
    'UpdateUnitDto.ts': {
      find: 'version?: string;',
      replace: 'version?: number;'
    },
    'CreateTvShowDto.ts': {
      find: 'version?: string;',
      replace: 'version?: number;'
    },
    'UpdateTvShowDto.ts': {
      find: 'version?: string;',
      replace: 'version?: number;'
    }
  };

  Object.entries(dtosToFix).forEach(([fileName, fix]) => {
    const filePath = path.join(dtoDir, fileName);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(fix.find)) {
        content = content.replace(new RegExp(fix.find, 'g'), fix.replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed ${fileName}`);
      }
    }
  });
}

// Adiciona método save aos repositórios que não têm
function addSaveMethodToRepositories() {
  const reposNeedingSave = [
    'VideoRepository.ts',
    'WatchlistEntryRepository.ts',
    'TvShowRepository.ts',
    'UnitRepository.ts'
  ];

  const saveMethod = `
  async save(entity: any): Promise<any> {
    return await this.manager.save(entity);
  }
`;

  reposNeedingSave.forEach(repoFile => {
    const filePath = path.join(__dirname, 'src/repositories', repoFile);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes('async save(')) {
        // Adiciona antes do último fechamento de classe
        const lastBrace = content.lastIndexOf('}');
        content = content.slice(0, lastBrace) + saveMethod + '\n' + content.slice(lastBrace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Added save method to ${repoFile}`);
      }
    }
  });
}

// Corrige o problema do UnitRepository
function fixUnitRepository() {
  const filePath = path.join(__dirname, 'src/repositories/UnitRepository.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Adiciona métodos faltantes
    const additionalMethods = `
  async findByIdActive(id: string | number): Promise<Unit | null> {
    return this.findOne({
      where: { id: Number(id), deleted: false }
    });
  }

  async findWithPagination(page: number = 1, limit: number = 10): Promise<{ data: Unit[], total: number }> {
    const [data, total] = await this.findAndCount({
      where: { deleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' }
    });
    return { data, total };
  }

  async searchByName(name: string): Promise<Unit[]> {
    return this.createQueryBuilder('unit')
      .where("LOWER(unit.name) LIKE LOWER(:name)", { name: \`%\${name}%\` })
      .andWhere("unit.deleted = :deleted", { deleted: false })
      .getMany();
  }

  async softDelete(id: string | number): Promise<void> {
    await this.update(Number(id), { deleted: true });
  }

  async save(entity: Unit): Promise<Unit> {
    return await this.manager.save(entity);
  }
`;

    if (!content.includes('findByIdActive')) {
      const lastBrace = content.lastIndexOf('}');
      content = content.slice(0, lastBrace) + additionalMethods + '\n' + content.slice(lastBrace);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✓ Fixed UnitRepository');
    }
  }
}

// Corrige imports de tipos
function fixTypeImports() {
  const filesToFix = [
    'src/dto/ClassDto.ts',
    'src/dto/CourseDto.ts',
    'src/dto/EducationCycleDto.ts',
    'src/dto/InstitutionDto.ts',
    'src/dto/SchoolDto.ts',
    'src/dto/SchoolManagerDto.ts',
    'src/dto/UserClassDto.ts'
  ];

  filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Corrige imports de tipos do frontend
      content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/src\/types\//g, "from '../types/");
      content = content.replace(/from ['"]@\/types\//g, "from '../types/");
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed imports in ${file}`);
    }
  });
}

// Corrige o VideoResponseDto
function fixVideoResponseDto() {
  const filePath = path.join(__dirname, 'src/dto/VideoResponseDto.ts');
  const content = `export interface VideoResponseDto {
  id: number;
  title: string;
  description?: string;
  filePath?: string;
  thumbnailUrl?: string;
  duration?: number;
  tvShowId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  createdAt: string;
  updatedAt: string;
  // Campos adicionais necessários
  url?: string;
  type?: string;
  genre?: string;
  releaseDate?: string;
}`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Updated VideoResponseDto');
}

// Executa todas as correções
console.log('Starting remaining error fixes...\n');

console.log('1. Adding missing types to common.ts...');
addMissingTypesToCommon();

console.log('\n2. Fixing DTO issues...');
fixDtoIssues();

console.log('\n3. Adding save method to repositories...');
addSaveMethodToRepositories();

console.log('\n4. Fixing UnitRepository...');
fixUnitRepository();

console.log('\n5. Fixing type imports...');
fixTypeImports();

console.log('\n6. Fixing VideoResponseDto...');
fixVideoResponseDto();

console.log('\nRemaining error fixes completed!');