#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  CONFIGURANDO ESTRUTURA MODULAR DO PORTAL EDUCACIONAL');
console.log('='.repeat(60));

// Estrutura modular definida
const moduleStructure = {
  'src/core': {
    'database': ['connection.ts', 'migration-legacy.ts', 'transaction-manager.ts'],
    'entities': ['BaseEntity.ts', 'TimestampEntity.ts', 'SaberconEntity.ts'],
    'types': ['common.types.ts', 'legacy.types.ts', 'api.types.ts'],
    'utils': ['legacy-mapper.ts', 'validators.ts', 'formatters.ts'],
    'config': ['database.config.ts', 'redis.config.ts', 'app.config.ts'],
    'middleware': ['auth.middleware.ts', 'legacy.middleware.ts', 'validation.middleware.ts']
  },
  'src/modules/auth': {
    'entities': ['User.entity.ts', 'Session.entity.ts', 'Role.entity.ts', 'UserProfile.entity.ts'],
    'services': ['AuthService.ts', 'SessionService.ts', 'PermissionService.ts', 'LegacyAuthService.ts'],
    'controllers': ['AuthController.ts', 'UserController.ts', 'ProfileController.ts'],
    'dto': ['auth.dto.ts', 'user.dto.ts', 'profile.dto.ts'],
    'routes': ['index.ts'],
    'middleware': ['auth.middleware.ts'],
    'tests': ['auth.service.test.ts', 'auth.controller.test.ts', 'session.service.test.ts'],
    'types': ['auth.types.ts'],
    'utils': ['auth.utils.ts'],
    'constants': ['auth.constants.ts']
  },
  'src/modules/institution': {
    'entities': ['Institution.entity.ts', 'SchoolUnit.entity.ts', 'ClassGroup.entity.ts', 'EducationCycle.entity.ts'],
    'services': ['InstitutionService.ts', 'SchoolUnitService.ts', 'ClassGroupService.ts', 'HierarchyService.ts'],
    'controllers': ['InstitutionController.ts', 'SchoolUnitController.ts', 'ClassGroupController.ts'],
    'dashboards': ['AdminDashboard.component.ts', 'ManagerDashboard.component.ts', 'CoordinatorDashboard.component.ts'],
    'reports': ['InstitutionReports.ts', 'HierarchyReports.ts'],
    'dto': ['institution.dto.ts', 'school-unit.dto.ts', 'class-group.dto.ts'],
    'routes': ['index.ts'],
    'tests': ['institution.service.test.ts'],
    'types': ['institution.types.ts']
  },
  'src/modules/academic': {
    'entities': ['Course.entity.ts', 'Module.entity.ts', 'Lesson.entity.ts', 'Assignment.entity.ts', 'Grade.entity.ts', 'Attendance.entity.ts'],
    'services': ['CourseService.ts', 'LessonService.ts', 'GradeService.ts', 'AttendanceService.ts', 'ProgressService.ts'],
    'controllers': ['CourseController.ts', 'GradeController.ts', 'AttendanceController.ts', 'ProgressController.ts'],
    'dashboards': ['TeacherDashboard.component.ts', 'StudentDashboard.component.ts', 'CoordinatorDashboard.component.ts'],
    'reports': ['AcademicReports.ts', 'ProgressReports.ts', 'AttendanceReports.ts'],
    'dto': ['course.dto.ts', 'grade.dto.ts', 'attendance.dto.ts'],
    'routes': ['index.ts'],
    'tests': ['academic.service.test.ts'],
    'types': ['academic.types.ts']
  },
  'src/modules/content': {
    'entities': ['Video.entity.ts', 'TVShow.entity.ts', 'Book.entity.ts', 'File.entity.ts', 'Author.entity.ts', 'Genre.entity.ts', 'Theme.entity.ts', 'Collection.entity.ts'],
    'services': ['VideoService.ts', 'TVShowService.ts', 'BookService.ts', 'FileService.ts', 'AuthorService.ts', 'SearchService.ts', 'RecommendationService.ts'],
    'controllers': ['VideoController.ts', 'TVShowController.ts', 'BookController.ts', 'FileController.ts', 'SearchController.ts'],
    'portals': ['LiteraturePortal.component.ts', 'VideoPortal.component.ts', 'TVShowPortal.component.ts', 'StudentPortal.component.ts'],
    'players': ['VideoPlayer.component.ts', 'PDFReader.component.ts', 'EpubReader.component.ts'],
    'dto': ['video.dto.ts', 'book.dto.ts', 'file.dto.ts'],
    'routes': ['index.ts'],
    'tests': ['content.service.test.ts'],
    'types': ['content.types.ts']
  },
  'src/modules/analytics': {
    'entities': ['UserActivity.entity.ts', 'ViewStatus.entity.ts', 'WatchList.entity.ts', 'Performance.entity.ts', 'Engagement.entity.ts'],
    'services': ['AnalyticsService.ts', 'ReportService.ts', 'MetricsService.ts', 'DashboardService.ts', 'ExportService.ts'],
    'controllers': ['AnalyticsController.ts', 'ReportController.ts', 'MetricsController.ts', 'DashboardController.ts'],
    'dashboards': ['SystemAnalytics.component.ts', 'InstitutionAnalytics.component.ts', 'ContentAnalytics.component.ts', 'UserAnalytics.component.ts'],
    'reports': ['UsageReports.ts', 'EngagementReports.ts', 'PerformanceReports.ts'],
    'dto': ['analytics.dto.ts', 'metrics.dto.ts'],
    'routes': ['index.ts'],
    'tests': ['analytics.service.test.ts'],
    'types': ['analytics.types.ts']
  },
  'src/modules/communication': {
    'entities': ['Notification.entity.ts', 'Message.entity.ts', 'Announcement.entity.ts', 'ForumPost.entity.ts', 'Comment.entity.ts'],
    'services': ['NotificationService.ts', 'MessageService.ts', 'AnnouncementService.ts', 'ForumService.ts', 'EmailService.ts'],
    'controllers': ['NotificationController.ts', 'MessageController.ts', 'AnnouncementController.ts', 'ForumController.ts'],
    'integrations': ['EmailProvider.ts', 'SMSProvider.ts', 'PushProvider.ts', 'WhatsAppProvider.ts'],
    'templates': {
      'email-templates': ['welcome.html', 'notification.html'],
      'sms-templates': ['notification.txt'],
      'push-templates': ['notification.json']
    },
    'dto': ['notification.dto.ts', 'message.dto.ts'],
    'routes': ['index.ts'],
    'tests': ['communication.service.test.ts'],
    'types': ['communication.types.ts']
  },
  'src/modules/guardian': {
    'entities': ['Guardian.entity.ts', 'GuardianStudent.entity.ts', 'GuardianAccess.entity.ts', 'GuardianReport.entity.ts'],
    'services': ['GuardianService.ts', 'AccessService.ts', 'ReportService.ts', 'NotificationService.ts'],
    'controllers': ['GuardianController.ts', 'AccessController.ts', 'ReportController.ts'],
    'dashboards': ['GuardianDashboard.component.ts', 'StudentProgress.component.ts'],
    'reports': ['StudentReports.ts', 'AttendanceReports.ts', 'GradeReports.ts'],
    'dto': ['guardian.dto.ts', 'access.dto.ts'],
    'routes': ['index.ts'],
    'tests': ['guardian.service.test.ts'],
    'types': ['guardian.types.ts']
  }
};

// Backend modules
const backendModuleStructure = {
  'backend/src/core': {
    'database': ['connection.ts', 'migration-legacy.ts', 'transaction-manager.ts'],
    'entities': ['BaseEntity.ts', 'TimestampEntity.ts', 'SaberconEntity.ts'],
    'types': ['common.types.ts', 'legacy.types.ts', 'api.types.ts'],
    'utils': ['legacy-mapper.ts', 'validators.ts', 'formatters.ts'],
    'config': ['database.config.ts', 'redis.config.ts', 'app.config.ts'],
    'middleware': ['auth.middleware.ts', 'legacy.middleware.ts', 'validation.middleware.ts']
  },
  'backend/src/modules/auth': {
    'entities': ['User.entity.ts', 'Session.entity.ts', 'Role.entity.ts', 'UserProfile.entity.ts'],
    'services': ['AuthService.ts', 'SessionService.ts', 'PermissionService.ts', 'LegacyAuthService.ts'],
    'controllers': ['AuthController.ts', 'UserController.ts', 'ProfileController.ts'],
    'dto': ['auth.dto.ts', 'user.dto.ts', 'profile.dto.ts'],
    'routes': ['index.ts', 'auth.routes.ts', 'user.routes.ts'],
    'middleware': ['auth.middleware.ts'],
    'tests': ['auth.service.test.ts', 'auth.controller.test.ts'],
    'types': ['auth.types.ts'],
    'utils': ['auth.utils.ts'],
    'constants': ['auth.constants.ts']
  }
};

// Função para criar diretórios e arquivos
function createStructure(basePath, structure) {
  Object.keys(structure).forEach(dir => {
    const fullPath = path.join(basePath, dir);
    
    // Criar diretório se não existir
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Criado: ${fullPath}`);
    }

    const items = structure[dir];
    
    if (Array.isArray(items)) {
      // Criar arquivos
      items.forEach(file => {
        const filePath = path.join(fullPath, file);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, getTemplateContent(file, dir));
          console.log(`📄 Criado: ${filePath}`);
        }
      });
    } else if (typeof items === 'object') {
      // Criar subdiretórios recursivamente
      createStructure(fullPath, { '': items });
    }
  });
}

// Função para gerar conteúdo template baseado no tipo de arquivo
function getTemplateContent(filename, directory) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  
  if (ext === '.ts') {
    if (filename.endsWith('.entity.ts')) {
      return getEntityTemplate(basename);
    } else if (filename.endsWith('.service.ts')) {
      return getServiceTemplate(basename);
    } else if (filename.endsWith('.controller.ts')) {
      return getControllerTemplate(basename);
    } else if (filename.endsWith('.dto.ts')) {
      return getDTOTemplate(basename);
    } else if (filename.endsWith('.types.ts')) {
      return getTypesTemplate(basename);
    } else if (filename.endsWith('.middleware.ts')) {
      return getMiddlewareTemplate(basename);
    } else if (filename.endsWith('.test.ts')) {
      return getTestTemplate(basename);
    } else if (filename.endsWith('.component.ts')) {
      return getComponentTemplate(basename);
    } else if (filename === 'index.ts') {
      return getIndexTemplate(directory);
    }
    return getGenericTemplate(basename);
  }
  
  return `// ${filename} - Arquivo gerado automaticamente\n// Implementar conforme necessidades específicas\n`;
}

// Templates específicos
function getEntityTemplate(name) {
  return `import { BaseEntity } from '../../core/entities/BaseEntity';

export interface ${name.replace('.entity', '')} extends BaseEntity {
  // Definir propriedades específicas da entidade
  id: string;
  createdAt: Date;
  updatedAt: Date;
  // Propriedades específicas para ${name}
}

export class ${name.replace('.entity', '')}Entity implements ${name.replace('.entity', '')} {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<${name.replace('.entity', '')}>) {
    Object.assign(this, data);
    this.id = data.id || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
`;
}

function getServiceTemplate(name) {
  return `export class ${name.replace('.ts', '')} {
  constructor() {
    // Inicialização do serviço
  }

  async create(data: any): Promise<any> {
    // Implementar lógica de criação
    throw new Error('Método não implementado');
  }

  async findById(id: string): Promise<any> {
    // Implementar lógica de busca por ID
    throw new Error('Método não implementado');
  }

  async findAll(): Promise<any[]> {
    // Implementar lógica de listagem
    throw new Error('Método não implementado');
  }

  async update(id: string, data: any): Promise<any> {
    // Implementar lógica de atualização
    throw new Error('Método não implementado');
  }

  async delete(id: string): Promise<boolean> {
    // Implementar lógica de exclusão
    throw new Error('Método não implementado');
  }
}
`;
}

function getControllerTemplate(name) {
  return `import { Request, Response } from 'express';

export class ${name.replace('.ts', '')} {
  constructor() {
    // Inicialização do controller
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      // Implementar lógica de criação
      res.status(201).json({ message: 'Criado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Implementar lógica de busca
      res.status(200).json({ id });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      // Implementar lógica de listagem
      res.status(200).json([]);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Implementar lógica de atualização
      res.status(200).json({ message: 'Atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Implementar lógica de exclusão
      res.status(200).json({ message: 'Excluído com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
`;
}

function getDTOTemplate(name) {
  return `export interface Create${name.replace('.dto', '').replace(/^\w/, c => c.toUpperCase())}DTO {
  // Definir propriedades para criação
}

export interface Update${name.replace('.dto', '').replace(/^\w/, c => c.toUpperCase())}DTO {
  // Definir propriedades para atualização
}

export interface ${name.replace('.dto', '').replace(/^\w/, c => c.toUpperCase())}ResponseDTO {
  // Definir propriedades para resposta
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
`;
}

function getTypesTemplate(name) {
  return `// Types específicos para ${name.replace('.types', '')}

export interface ${name.replace('.types', '').replace(/^\w/, c => c.toUpperCase())}Config {
  // Configurações específicas
}

export interface ${name.replace('.types', '').replace(/^\w/, c => c.toUpperCase())}Options {
  // Opções específicas
}

export enum ${name.replace('.types', '').replace(/^\w/, c => c.toUpperCase())}Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}
`;
}

function getMiddlewareTemplate(name) {
  return `import { Request, Response, NextFunction } from 'express';

export const ${name.replace('.middleware.ts', '').replace(/^\w/, c => c.toLowerCase())}Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Implementar lógica do middleware
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro no middleware ${name}' });
  }
};
`;
}

function getTestTemplate(name) {
  const testName = name.replace('.test.ts', '');
  return `import { ${testName.replace(/^\w/, c => c.toUpperCase())} } from './${testName}';

describe('${testName}', () => {
  let instance: ${testName.replace(/^\w/, c => c.toUpperCase())};

  beforeEach(() => {
    instance = new ${testName.replace(/^\w/, c => c.toUpperCase())}();
  });

  it('should be defined', () => {
    expect(instance).toBeDefined();
  });

  // Adicionar mais testes conforme necessário
});
`;
}

function getComponentTemplate(name) {
  return `import React from 'react';

interface ${name.replace('.component.ts', '')}Props {
  // Definir props do componente
}

export const ${name.replace('.component.ts', '')}: React.FC<${name.replace('.component.ts', '')}Props> = (props) => {
  return (
    <div>
      <h1>${name.replace('.component.ts', '')}</h1>
      {/* Implementar UI do componente */}
    </div>
  );
};

export default ${name.replace('.component.ts', '')};
`;
}

function getIndexTemplate(directory) {
  return `// Exports do módulo ${directory}
// Adicionar exports conforme implementação dos arquivos

export * from './entities';
export * from './services';
export * from './controllers';
export * from './dto';
export * from './types';
`;
}

function getGenericTemplate(name) {
  return `// ${name} - Implementar conforme necessidades específicas

export const ${name.replace(/\W/g, '')} = {
  // Implementação
};
`;
}

// Função principal
function main() {
  try {
    console.log('🔧 Criando estrutura modular...\n');

    // Criar estrutura do frontend
    console.log('📱 Criando módulos do Frontend...');
    createStructure('.', moduleStructure);

    // Criar estrutura do backend
    console.log('\n🔧 Criando módulos do Backend...');
    createStructure('.', backendModuleStructure);

    // Criar arquivos de configuração adicionais
    console.log('\n⚙️  Criando arquivos de configuração...');
    createConfigFiles();

    // Atualizar package.json com scripts modulares
    console.log('\n📦 Atualizando package.json...');
    updatePackageJson();

    console.log('\n✅ ESTRUTURA MODULAR CRIADA COM SUCESSO!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Revisar os templates gerados');
    console.log('2. Implementar lógicas específicas de cada módulo');
    console.log('3. Configurar testes para cada módulo');
    console.log('4. Executar: npm run migrate:legacy-to-modules');
    
  } catch (error) {
    console.error('❌ Erro ao criar estrutura modular:', error.message);
    process.exit(1);
  }
}

// Criar arquivos de configuração específicos
function createConfigFiles() {
  // Criar configuração do NX Workspace
  const nxConfig = {
    "version": 2,
    "projects": {
      "portal-frontend": ".",
      "portal-backend": "backend"
    },
    "defaultProject": "portal-frontend"
  };

  fs.writeFileSync('nx.json', JSON.stringify(nxConfig, null, 2));
  console.log('📄 Criado: nx.json');

  // Criar configuração de paths para TypeScript
  const tsConfig = {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@core/*": ["src/core/*"],
        "@modules/*": ["src/modules/*"],
        "@auth/*": ["src/modules/auth/*"],
        "@institution/*": ["src/modules/institution/*"],
        "@academic/*": ["src/modules/academic/*"],
        "@content/*": ["src/modules/content/*"],
        "@analytics/*": ["src/modules/analytics/*"],
        "@communication/*": ["src/modules/communication/*"],
        "@guardian/*": ["src/modules/guardian/*"]
      }
    }
  };

  const existingTsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  existingTsConfig.compilerOptions = { ...existingTsConfig.compilerOptions, ...tsConfig.compilerOptions };
  
  fs.writeFileSync('tsconfig.json', JSON.stringify(existingTsConfig, null, 2));
  console.log('📄 Atualizado: tsconfig.json');

  // Criar arquivo de configuração modular
  const moduleConfig = {
    "modules": {
      "core": {
        "name": "Core",
        "version": "1.0.0",
        "description": "Módulo central do sistema"
      },
      "auth": {
        "name": "Authentication",
        "version": "1.0.0",
        "description": "Módulo de autenticação e autorização"
      },
      "institution": {
        "name": "Institution Management",
        "version": "1.0.0",
        "description": "Módulo de gestão institucional"
      },
      "academic": {
        "name": "Academic Management",
        "version": "1.0.0",
        "description": "Módulo de gestão acadêmica"
      },
      "content": {
        "name": "Content Management",
        "version": "1.0.0",
        "description": "Módulo de gestão de conteúdo"
      },
      "analytics": {
        "name": "Analytics & Reports",
        "version": "1.0.0",
        "description": "Módulo de analytics e relatórios"
      },
      "communication": {
        "name": "Communication",
        "version": "1.0.0",
        "description": "Módulo de comunicação"
      },
      "guardian": {
        "name": "Guardian Portal",
        "version": "1.0.0",
        "description": "Módulo para responsáveis"
      }
    }
  };

  fs.writeFileSync('modules.config.json', JSON.stringify(moduleConfig, null, 2));
  console.log('📄 Criado: modules.config.json');
}

// Atualizar package.json com scripts modulares
function updatePackageJson() {
  const packagePath = 'package.json';
  const backendPackagePath = 'backend/package.json';

  // Atualizar package.json do frontend
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    packageJson.scripts = {
      ...packageJson.scripts,
      "setup:modular-structure": "node scripts/setup-modular-structure.js",
      "migrate:legacy-to-modules": "node scripts/migrate-legacy-to-modules.js",
      "test:modules": "jest --testPathPattern=modules",
      "lint:modules": "eslint src/modules/**/*.ts",
      "build:modules": "next build",
      "dev:modules": "next dev"
    };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('📄 Atualizado: package.json');
  }

  // Atualizar package.json do backend
  if (fs.existsSync(backendPackagePath)) {
    const backendPackageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
    
    backendPackageJson.scripts = {
      ...backendPackageJson.scripts,
      "setup:backend-modules": "node scripts/setup-backend-modules.js",
      "migrate:backend-modules": "node scripts/migrate-backend-modules.js",
      "test:backend-modules": "jest --testPathPattern=modules",
      "lint:backend-modules": "eslint src/modules/**/*.ts"
    };

    fs.writeFileSync(backendPackagePath, JSON.stringify(backendPackageJson, null, 2));
    console.log('📄 Atualizado: backend/package.json');
  }
}

// Executar script
if (require.main === module) {
  main();
} 