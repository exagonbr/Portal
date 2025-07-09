#!/bin/bash

echo "🔧 Iniciando correção automática dos erros de TypeScript..."

# Função para corrigir controllers
fix_controller() {
    local file=$1
    local repo_name=$2
    
    echo "📝 Corrigindo controller: $file"
    
    # Backup do arquivo original
    cp "$file" "$file.backup"
    
    # Corrigir importações e estrutura do controller
    sed -i 's/const [a-zA-Z]*Repository = new [a-zA-Z]*Repository();//' "$file"
    
    # Adicionar propriedade privada
    sed -i "/class [a-zA-Z]*Controller extends BaseController/a\    private ${repo_name}Repository: ${repo_name}Repository;\n" "$file"
    
    # Corrigir construtor
    sed -i "/constructor() {/,/}/c\    constructor() {\n        const repository = new ${repo_name}Repository();\n        super(repository);\n        this.${repo_name}Repository = repository;\n    }" "$file"
    
    # Substituir referências de repository global para this.repository
    sed -i "s/${repo_name}Repository\./this.${repo_name}Repository./g" "$file"
    
    echo "✅ Controller $file corrigido"
}

# Função para corrigir repositórios
fix_repository() {
    local file=$1
    local entity_name=$2
    
    echo "📝 Corrigindo repositório: $file"
    
    # Backup do arquivo original
    cp "$file" "$file.backup"
    
    # Adicionar importações necessárias
    if ! grep -q "import.*AppDataSource" "$file"; then
        sed -i "1a import { AppDataSource } from '../config/typeorm.config';" "$file"
    fi
    
    if ! grep -q "import.*Repository.*from 'typeorm'" "$file"; then
        sed -i "1a import { Repository } from 'typeorm';" "$file"
    fi
    
    # Adicionar propriedade repository
    sed -i "/export class [a-zA-Z]*Repository extends ExtendedRepository/a\  private repository: Repository<${entity_name}>;\n" "$file"
    
    # Corrigir construtor
    sed -i "/constructor() {/,/}/c\  constructor() {\n    super('${entity_name,,}');\n    this.repository = AppDataSource.getRepository(${entity_name});\n  }" "$file"
    
    echo "✅ Repositório $file corrigido"
}

# Lista de controllers para corrigir
controllers=(
    "src/controllers/LanguageController.ts:Language"
    "src/controllers/MediaEntryController.ts:MediaEntry"
    "src/controllers/NotificationController.ts:Notification"
    "src/controllers/PublicController.ts:Public"
    "src/controllers/PublisherController.ts:Publisher"
    "src/controllers/EducationPeriodController.ts:EducationPeriod"
    "src/controllers/TargetAudienceController.ts:TargetAudience"
    "src/controllers/EducationCyclesController.ts:EducationCycles"
    "src/controllers/TagController.ts:Tag"
    "src/controllers/AnnouncementController.ts:Announcement"
    "src/controllers/VideoController.ts:Video"
    "src/controllers/InstitutionController.ts:Institution"
    "src/controllers/UnitController.ts:Unit"
    "src/controllers/UserController.ts:User"
    "src/controllers/ActivitySummariesController.ts:ActivitySummaries"
    "src/controllers/RoleController.ts:Role"
    "src/controllers/GroupController.ts:Group"
    "src/controllers/VideoCollectionController.ts:VideoCollection"
    "src/controllers/SchoolController.ts:School"
    "src/controllers/SystemSettingsController.ts:SystemSettings"
    "src/controllers/ActivitySessionsController.ts:ActivitySessions"
    "src/controllers/SecurityPoliciesController.ts:SecurityPolicies"
    "src/controllers/ClassController.ts:Class"
    "src/controllers/QuizController.ts:Quiz"
    "src/controllers/NotificationQueueController.ts:NotificationQueue"
    "src/controllers/AuthorController.ts:Author"
    "src/controllers/SubjectController.ts:Subject"
    "src/controllers/ThemeController.ts:Theme"
    "src/controllers/CourseController.ts:Course"
    "src/controllers/BookController.ts:Book"
    "src/controllers/EducationalStageController.ts:EducationalStage"
    "src/controllers/CertificateController.ts:Certificate"
    "src/controllers/TeacherSubjectController.ts:TeacherSubject"
    "src/controllers/WatchlistEntryController.ts:WatchlistEntry"
    "src/controllers/TvShowController.ts:TvShow"
    "src/controllers/GenreController.ts:Genre"
)

# Lista de repositórios para corrigir
repositories=(
    "src/repositories/LanguageRepository.ts:Language"
    "src/repositories/MediaEntryRepository.ts:MediaEntry"
    "src/repositories/NotificationRepository.ts:Notification"
    "src/repositories/PublicRepository.ts:Public"
    "src/repositories/PublisherRepository.ts:Publisher"
    "src/repositories/LessonRepository.ts:Lesson"
    "src/repositories/ModuleRepository.ts:Module"
    "src/repositories/QuestionRepository.ts:Question"
    "src/repositories/QuizRepository.ts:Quiz"
    "src/repositories/RoleRepository.ts:Role"
    "src/repositories/SchoolManagerRepository.ts:SchoolManager"
    "src/repositories/SchoolRepository.ts:School"
    "src/repositories/SettingsRepository.ts:Settings"
    "src/repositories/SubjectRepository.ts:Subject"
    "src/repositories/TagRepository.ts:Tag"
    "src/repositories/TargetAudienceRepository.ts:TargetAudience"
    "src/repositories/ThemeRepository.ts:Theme"
    "src/repositories/UnitRepository.ts:Unit"
    "src/repositories/UserClassRepository.ts:UserClass"
    "src/repositories/UserRepository.ts:User"
    "src/repositories/VideoCollectionRepository.ts:VideoCollection"
    "src/repositories/VideoRepository.ts:Video"
)

# Corrigir controllers
echo "🔧 Corrigindo controllers..."
for controller in "${controllers[@]}"; do
    IFS=':' read -r file entity <<< "$controller"
    if [ -f "$file" ]; then
        repo_name=$(echo "$entity" | sed 's/Controller//')
        fix_controller "$file" "$repo_name"
    else
        echo "⚠️  Arquivo não encontrado: $file"
    fi
done

# Corrigir repositórios
echo "🔧 Corrigindo repositórios..."
for repo in "${repositories[@]}"; do
    IFS=':' read -r file entity <<< "$repo"
    if [ -f "$file" ]; then
        fix_repository "$file" "$entity"
    else
        echo "⚠️  Arquivo não encontrado: $file"
    fi
done

echo "🎉 Correção automática concluída!"
echo "📋 Verificando se ainda há erros..."

# Verificar se ainda há erros
cd /var/www/portal/backend
npx tsc --noEmit --skipLibCheck

echo "✅ Script de correção concluído!" 