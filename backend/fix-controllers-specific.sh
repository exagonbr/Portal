#!/bin/bash

echo "🔧 Corrigindo controllers específicos..."

# Função para corrigir um controller específico
fix_specific_controller() {
    local file=$1
    local repo_name=$2
    
    echo "📝 Corrigindo controller: $file"
    
    if [ ! -f "$file" ]; then
        echo "⚠️  Arquivo não encontrado: $file"
        return
    fi
    
    # Backup do arquivo original
    cp "$file" "$file.backup2"
    
    # Remover variável global se existir
    sed -i '/const [a-zA-Z]*Repository = new [a-zA-Z]*Repository();/d' "$file"
    
    # Adicionar propriedade privada se não existir
    if ! grep -q "private ${repo_name}Repository:" "$file"; then
        sed -i "/class [a-zA-Z]*Controller extends BaseController/a\    private ${repo_name}Repository: ${repo_name}Repository;\n" "$file"
    fi
    
    # Corrigir construtor
    sed -i "/constructor() {/,/}/c\    constructor() {\n        const repository = new ${repo_name}Repository();\n        super(repository);\n        this.${repo_name}Repository = repository;\n    }" "$file"
    
    # Substituir referências de repository global para this.repository
    sed -i "s/${repo_name}Repository\./this.${repo_name}Repository./g" "$file"
    
    echo "✅ Controller $file corrigido"
}

# Lista de controllers que ainda precisam ser corrigidos
controllers_to_fix=(
    "src/controllers/ActivitySessionsController.ts:ActivitySessions"
    "src/controllers/ActivitySummariesController.ts:ActivitySummaries"
    "src/controllers/AnnouncementController.ts:Announcement"
    "src/controllers/AnswerController.ts:Answer"
    "src/controllers/AuthorController.ts:Author"
    "src/controllers/BookController.ts:Book"
    "src/controllers/CertificateController.ts:Certificate"
    "src/controllers/ClassController.ts:Class"
    "src/controllers/ClassesController.ts:Classes"
    "src/controllers/CourseController.ts:Course"
    "src/controllers/EducationCyclesController.ts:EducationCycles"
    "src/controllers/EducationPeriodController.ts:EducationPeriod"
    "src/controllers/EducationalStageController.ts:EducationalStage"
    "src/controllers/GenreController.ts:Genre"
    "src/controllers/GroupController.ts:Group"
    "src/controllers/InstitutionController.ts:Institution"
    "src/controllers/NotificationQueueController.ts:NotificationQueue"
    "src/controllers/ReportController.ts:Report"
    "src/controllers/RoleController.ts:Role"
    "src/controllers/RolePermissionsController.ts:RolePermissions"
    "src/controllers/RolesController.ts:Roles"
    "src/controllers/SchoolController.ts:School"
    "src/controllers/SecurityPoliciesController.ts:SecurityPolicies"
    "src/controllers/SubjectController.ts:Subject"
    "src/controllers/SystemSettingsController.ts:SystemSettings"
    "src/controllers/TagController.ts:Tag"
    "src/controllers/TargetAudienceController.ts:TargetAudience"
    "src/controllers/TeacherSubjectController.ts:TeacherSubject"
    "src/controllers/ThemeController.ts:Theme"
    "src/controllers/TvShowController.ts:TvShow"
    "src/controllers/UnitController.ts:Unit"
    "src/controllers/UnitsController.ts:Units"
    "src/controllers/UserController.ts:User"
    "src/controllers/UsersController.ts:Users"
    "src/controllers/VideoController.ts:Video"
    "src/controllers/ViewingStatusController.ts:ViewingStatus"
    "src/controllers/WatchlistEntryController.ts:WatchlistEntry"
)

# Corrigir controllers
for controller in "${controllers_to_fix[@]}"; do
    IFS=':' read -r file entity <<< "$controller"
    repo_name=$(echo "$entity" | sed 's/Controller//')
    fix_specific_controller "$file" "$repo_name"
done

echo "🎉 Correção específica dos controllers concluída!" 