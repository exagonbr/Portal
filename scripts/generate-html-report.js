#!/usr/bin/env node

/**
 * Gerador de Relatório HTML para Testes de API
 * Converte o relatório JSON em um relatório HTML interativo
 * Autor: Kilo Code
 * Data: 2025-01-07
 */

const fs = require('fs');
const path = require('path');

// Função para gerar HTML
function generateHTMLReport(jsonData) {
  const timestamp = new Date(jsonData.timestamp).toLocaleString('pt-BR');
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Testes de API - Portal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.2em;
            margin-bottom: 20px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        .info { color: #3498db; }
        
        .section {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .section h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ecf0f1;
        }
        
        .routes-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .routes-table th,
        .routes-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .routes-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .routes-table tr:hover {
            background: #f8f9fa;
        }
        
        .method-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            margin: 2px;
        }
        
        .method-get { background: #e8f5e8; color: #27ae60; }
        .method-post { background: #fff3cd; color: #856404; }
        .method-put { background: #d1ecf1; color: #0c5460; }
        .method-delete { background: #f8d7da; color: #721c24; }
        .method-patch { background: #e2e3e5; color: #383d41; }
        .method-options { background: #f4f4f5; color: #6c757d; }
        
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        
        .status-200 { background: #27ae60; }
        .status-404 { background: #e74c3c; }
        .status-401 { background: #f39c12; }
        .status-500 { background: #8e44ad; }
        
        .auth-required {
            color: #e74c3c;
            font-size: 0.9em;
        }
        
        .filter-controls {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .filter-btn:hover,
        .filter-btn.active {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }
        
        .search-box {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            width: 300px;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 30px;
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .routes-table {
                font-size: 0.9em;
            }
            
            .filter-controls {
                flex-direction: column;
            }
            
            .search-box {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Relatório de Testes de API</h1>
            <div class="subtitle">Portal - Sistema de Gestão Educacional</div>
            <div style="color: #7f8c8d; margin-top: 10px;">
                📅 Gerado em: ${timestamp}<br>
                🌐 Base URL: ${jsonData.baseUrl}
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number info">${jsonData.totalRoutes}</div>
                <div class="stat-label">Total de Rotas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info">${jsonData.summary.total}</div>
                <div class="stat-label">Total de Testes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success">${jsonData.summary.success}</div>
                <div class="stat-label">Sucessos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${jsonData.summary.failed}</div>
                <div class="stat-label">Falhas</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning">${jsonData.summary.authRequired}</div>
                <div class="stat-label">Requer Auth</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${jsonData.authSuccess ? 'success' : 'error'}">${jsonData.authSuccess ? '✅' : '❌'}</div>
                <div class="stat-label">Autenticação</div>
            </div>
        </div>
        
        <div class="section">
            <h2>📊 Distribuição por Status HTTP</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                ${Object.entries(jsonData.summary.byStatus).map(([status, count]) => `
                    <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <div style="font-size: 1.5em; font-weight: bold; color: ${status === '200' ? '#27ae60' : '#e74c3c'};">${count}</div>
                        <div style="color: #7f8c8d; font-size: 0.9em;">Status ${status}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2>🔍 Rotas Descobertas</h2>
            <div class="filter-controls">
                <input type="text" class="search-box" placeholder="🔍 Buscar rotas..." id="searchBox">
                <button class="filter-btn active" onclick="filterRoutes('all')">Todas</button>
                <button class="filter-btn" onclick="filterRoutes('auth')">Com Auth</button>
                <button class="filter-btn" onclick="filterRoutes('no-auth')">Sem Auth</button>
                <button class="filter-btn" onclick="filterRoutes('failed')">Com Falhas</button>
            </div>
            
            <table class="routes-table" id="routesTable">
                <thead>
                    <tr>
                        <th>Rota</th>
                        <th>Métodos</th>
                        <th>Auth</th>
                        <th>Testes</th>
                        <th>Status</th>
                        <th>Tempo Médio</th>
                    </tr>
                </thead>
                <tbody>
                    ${jsonData.routes.map(route => {
                        const avgTime = route.tests.length > 0 
                            ? Math.round(route.tests.reduce((sum, test) => sum + test.responseTime, 0) / route.tests.length)
                            : 0;
                        const successCount = route.tests.filter(test => test.success).length;
                        const totalTests = route.tests.length;
                        
                        return `
                            <tr class="route-row" data-auth="${route.hasAuth}" data-success="${successCount === totalTests}">
                                <td>
                                    <strong>/api${route.path}</strong>
                                    ${route.description ? `<br><small style="color: #7f8c8d;">${route.description}</small>` : ''}
                                </td>
                                <td>
                                    ${route.methods.map(method => 
                                        `<span class="method-badge method-${method.toLowerCase()}">${method}</span>`
                                    ).join('')}
                                </td>
                                <td>
                                    ${route.hasAuth ? '<span class="auth-required">🔒 Sim</span>' : '🔓 Não'}
                                </td>
                                <td>
                                    <strong>${successCount}/${totalTests}</strong>
                                    ${totalTests > 0 ? `(${Math.round((successCount/totalTests)*100)}%)` : ''}
                                </td>
                                <td>
                                    ${route.tests.map(test => 
                                        `<span class="status-badge status-${test.status}">${test.status}</span>`
                                    ).join(' ')}
                                </td>
                                <td>${avgTime}ms</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>🛠️ Gerado pelo Script de Mapeamento de API - Portal</p>
            <p>📧 Desenvolvido por Kilo Code</p>
        </div>
    </div>
    
    <script>
        // Função de busca
        document.getElementById('searchBox').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.route-row');
            
            rows.forEach(row => {
                const routePath = row.cells[0].textContent.toLowerCase();
                const methods = row.cells[1].textContent.toLowerCase();
                
                if (routePath.includes(searchTerm) || methods.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
        
        // Função de filtro
        function filterRoutes(filter) {
            const rows = document.querySelectorAll('.route-row');
            const buttons = document.querySelectorAll('.filter-btn');
            
            // Atualizar botões ativos
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            rows.forEach(row => {
                const hasAuth = row.dataset.auth === 'true';
                const isSuccess = row.dataset.success === 'true';
                
                let show = true;
                
                switch(filter) {
                    case 'auth':
                        show = hasAuth;
                        break;
                    case 'no-auth':
                        show = !hasAuth;
                        break;
                    case 'failed':
                        show = !isSuccess;
                        break;
                    case 'all':
                    default:
                        show = true;
                        break;
                }
                
                row.style.display = show ? '' : 'none';
            });
        }
        
        // Adicionar efeitos de hover
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    </script>
</body>
</html>
  `;
}

// Função principal
function main() {
  const reportsDir = path.join(process.cwd(), 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.error('❌ Diretório de relatórios não encontrado!');
    console.log('💡 Execute primeiro: node scripts/run-api-test.js');
    process.exit(1);
  }
  
  // Encontrar o relatório JSON mais recente
  const jsonFiles = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('api-test-report-') && file.endsWith('.json'))
    .sort()
    .reverse();
  
  if (jsonFiles.length === 0) {
    console.error('❌ Nenhum relatório JSON encontrado!');
    console.log('💡 Execute primeiro: node scripts/run-api-test.js');
    process.exit(1);
  }
  
  const latestJsonFile = jsonFiles[0];
  const jsonPath = path.join(reportsDir, latestJsonFile);
  
  console.log(`📄 Lendo relatório: ${latestJsonFile}`);
  
  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const htmlContent = generateHTMLReport(jsonData);
    
    const htmlFileName = latestJsonFile.replace('.json', '.html');
    const htmlPath = path.join(reportsDir, htmlFileName);
    
    fs.writeFileSync(htmlPath, htmlContent);
    
    console.log('✅ Relatório HTML gerado com sucesso!');
    console.log(`📁 Arquivo: ${htmlPath}`);
    console.log(`🌐 Abra o arquivo no navegador para visualizar o relatório interativo`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório HTML:', error.message);
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = { generateHTMLReport };