const fs = require('fs');
const path = require('path');

// Lista de serviços a serem atualizados
const servicesToUpdate = [
  'activitySummariesService.ts',
  'rolePermissionsService.ts',
  'securityPoliciesService.ts',
  'notificationqueueService.ts',
  'teachersubjectService.ts',
  'watchlistentryService.ts',
];

// Diretório dos serviços
const servicesDir = path.join(__dirname, 'src', 'services');

// Função para atualizar um serviço
function updateService(serviceFile) {
  const filePath = path.join(servicesDir, serviceFile);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Arquivo não encontrado: ${serviceFile}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Adicionar importação do apiClient se não existir
  if (!content.includes('import { apiClient }')) {
    content = content.replace(
      'import { BaseApiService }',
      'import { BaseApiService } from \'./base-api-service\';\nimport { apiClient } from \'@/lib/api-client\''
    );
  }
  
  // Substituir chamadas fetch por apiClient
  content = content.replace(
    /const response = await fetch\(`\${this\.basePath}([^`]*)`,[^)]*\);(\s+)if \(!response\.ok\) \{[^}]*\}(\s+)return response\.json\(\);/g,
    'const response = await apiClient.get<any>(`${this.basePath}$1`);\n    return response.data;'
  );
  
  // Substituir chamadas fetch POST
  content = content.replace(
    /const response = await fetch\(`\${this\.basePath}([^`]*)`,[^]*?method: 'POST',[^]*?body: JSON\.stringify\(([^)]*)\),[^)]*\);(\s+)if \(!response\.ok\) \{[^}]*\}(\s+)return response\.json\(\);/g,
    'const response = await apiClient.post<any>(`${this.basePath}$1`, $2);\n    return response.data;'
  );
  
  // Substituir chamadas fetch PUT
  content = content.replace(
    /const response = await fetch\(`\${this\.basePath}([^`]*)`,[^]*?method: 'PUT',[^]*?body: JSON\.stringify\(([^)]*)\),[^)]*\);(\s+)if \(!response\.ok\) \{[^}]*\}(\s+)return response\.json\(\);/g,
    'const response = await apiClient.put<any>(`${this.basePath}$1`, $2);\n    return response.data;'
  );
  
  // Substituir chamadas fetch PUT sem body
  content = content.replace(
    /const response = await fetch\(`\${this\.basePath}([^`]*)`,[^]*?method: 'PUT',[^]*?\);(\s+)if \(!response\.ok\) \{[^}]*\}(\s+)return response\.json\(\);/g,
    'const response = await apiClient.put<any>(`${this.basePath}$1`);\n    return response.data;'
  );
  
  // Substituir chamadas fetch DELETE
  content = content.replace(
    /const response = await fetch\(`\${this\.basePath}([^`]*)`,[^]*?method: 'DELETE',[^]*?\);(\s+)if \(!response\.ok\) \{[^}]*\}(\s+)return response\.json\(\);/g,
    'const response = await apiClient.delete<any>(`${this.basePath}$1`);\n    return response.data;'
  );
  
  // Salvar arquivo atualizado
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Serviço atualizado: ${serviceFile}`);
}

// Atualizar todos os serviços
console.log('🚀 ATUALIZANDO SERVIÇOS DO FRONTEND\n');
console.log('=' .repeat(50));

servicesToUpdate.forEach(serviceFile => {
  updateService(serviceFile);
});

console.log('\n🎉 ATUALIZAÇÃO CONCLUÍDA!');
console.log(`📊 Serviços atualizados: ${servicesToUpdate.length}`); 