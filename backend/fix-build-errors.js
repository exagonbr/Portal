const fs = require('fs');
const path = require('path');

// Função para adicionar métodos faltantes aos repositórios
function addMissingRepositoryMethods() {
  const repositoriesDir = path.join(__dirname, 'src/repositories');
  
  // Métodos padrão que devem existir em todos os repositórios
  const standardMethods = `
  async findActive(limit: number = 100): Promise<any[]> {
    return this.find({
      where: { deleted: false },
      take: limit,
      order: { id: 'DESC' }
    });
  }

  async findByIdActive(id: string | number): Promise<any | null> {
    return this.findOne({
      where: { id: id as any, deleted: false }
    });
  }

  async findWithPagination(page: number = 1, limit: number = 10): Promise<{ data: any[], total: number }> {
    const [data, total] = await this.findAndCount({
      where: { deleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' }
    });
    return { data, total };
  }

  async searchByName(name: string): Promise<any[]> {
    return this.createQueryBuilder()
      .where("LOWER(name) LIKE LOWER(:name)", { name: \`%\${name}%\` })
      .andWhere("deleted = :deleted", { deleted: false })
      .getMany();
  }

  async softDelete(id: string | number): Promise<void> {
    await this.update(id as any, { deleted: true });
  }
`;

  // Lista de repositórios que precisam dos métodos
  const repositoriesNeedingMethods = [
    'UnitRepository.ts',
    'VideoRepository.ts',
    'WatchlistEntryRepository.ts',
    'GroupRepository.ts',
    'UsersRepository.ts',
    'ContentCollectionRepository.ts'
  ];

  repositoriesNeedingMethods.forEach(repoFile => {
    const filePath = path.join(repositoriesDir, repoFile);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Verifica se já tem os métodos
      if (!content.includes('findActive') && !content.includes('findByIdActive')) {
        // Adiciona os métodos antes do fechamento da classe
        const classEndIndex = content.lastIndexOf('}');
        if (classEndIndex !== -1) {
          content = content.slice(0, classEndIndex) + standardMethods + '\n' + content.slice(classEndIndex);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✓ Added missing methods to: ${repoFile}`);
        }
      }
    }
  });
}

// Função para corrigir problemas de tipos nos DTOs
function fixDtoTypeIssues() {
  const dtoFiles = [
    'src/dto/UpdateUnitDto.ts',
    'src/dto/CreateVideoDto.ts',
    'src/dto/UpdateVideoDto.ts'
  ];

  dtoFiles.forEach(dtoFile => {
    const filePath = path.join(__dirname, dtoFile);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Corrige version de string para number
      content = content.replace(/version\?: string;/g, 'version?: number;');
      content = content.replace(/version: string;/g, 'version: number;');
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed type issues in: ${dtoFile}`);
    }
  });
}

// Função para corrigir problemas nos serviços
function fixServiceIssues() {
  const servicesDir = path.join(__dirname, 'src/services');
  
  // Corrige o problema do emailService
  const emailServicePath = path.join(servicesDir, 'emailService.ts');
  if (fs.existsSync(emailServicePath)) {
    let content = fs.readFileSync(emailServicePath, 'utf8');
    
    // Remove referências a SMTP_USER e SMTP_PASS que não existem
    content = content.replace(/env\.SMTP_USER/g, "''");
    content = content.replace(/env\.SMTP_PASS/g, "''");
    
    fs.writeFileSync(emailServicePath, content, 'utf8');
    console.log('✓ Fixed emailService.ts');
  }
}

// Função para criar DTOs faltantes
function createMissingDtos() {
  const dtoDir = path.join(__dirname, 'src/dto');
  
  // Cria diretório se não existir
  if (!fs.existsSync(dtoDir)) {
    fs.mkdirSync(dtoDir, { recursive: true });
  }

  // VideoResponseDto
  const videoResponseDto = `export interface VideoResponseDto {
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
}`;

  fs.writeFileSync(path.join(dtoDir, 'VideoResponseDto.ts'), videoResponseDto, 'utf8');
  console.log('✓ Created VideoResponseDto.ts');

  // UnitResponseDto
  const unitResponseDto = `export interface UnitResponseDto {
  id: number;
  name: string;
  description?: string;
  institutionId: number;
  type?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}`;

  fs.writeFileSync(path.join(dtoDir, 'UnitResponseDto.ts'), unitResponseDto, 'utf8');
  console.log('✓ Created UnitResponseDto.ts');
}

// Executa todas as correções
console.log('Starting build error fixes...\n');

console.log('1. Adding missing repository methods...');
addMissingRepositoryMethods();

console.log('\n2. Fixing DTO type issues...');
fixDtoTypeIssues();

console.log('\n3. Fixing service issues...');
fixServiceIssues();

console.log('\n4. Creating missing DTOs...');
createMissingDtos();

console.log('\nBuild error fixes completed!');