const fs = require('fs');
const path = require('path');

const dumpDir = 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601';

// Função para extrair estrutura CREATE TABLE de um arquivo SQL
function extractTableStructure(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Encontrar a seção CREATE TABLE
        const createTableMatch = content.match(/CREATE TABLE `(\w+)` \(([\s\S]*?)\) ENGINE/);
        
        if (createTableMatch) {
            const tableName = createTableMatch[1];
            const tableDefinition = createTableMatch[2];
            
            // Extrair colunas
            const columns = [];
            const lines = tableDefinition.split('\n');
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('`') && !trimmed.startsWith('PRIMARY KEY') && !trimmed.startsWith('KEY') && !trimmed.startsWith('UNIQUE KEY')) {
                    const columnMatch = trimmed.match(/`(\w+)` ([\w\(\),\s]+)/);
                    if (columnMatch) {
                        columns.push({
                            name: columnMatch[1],
                            type: columnMatch[2].replace(/,$/, '').trim()
                        });
                    }
                }
            }
            
            return {
                tableName,
                columns,
                file: path.basename(filePath)
            };
        }
    } catch (error) {
        console.error(`Erro ao processar ${filePath}:`, error.message);
    }
    
    return null;
}

// Analisar todos os arquivos .sql
function analyzeDumpStructure() {
    const files = fs.readdirSync(dumpDir).filter(file => file.endsWith('.sql'));
    const tables = {};
    
    console.log('=== ANÁLISE DA ESTRUTURA DO DUMP SABERCON ===\n');
    
    for (const file of files) {
        const filePath = path.join(dumpDir, file);
        const structure = extractTableStructure(filePath);
        
        if (structure) {
            tables[structure.tableName] = structure;
            console.log(`TABELA: ${structure.tableName}`);
            console.log(`Arquivo: ${structure.file}`);
            console.log('Colunas:');
            structure.columns.forEach(col => {
                console.log(`  - ${col.name}: ${col.type}`);
            });
            console.log('\n' + '='.repeat(50) + '\n');
        }
    }
    
    // Resumo
    console.log(`\nTotal de tabelas encontradas: ${Object.keys(tables).length}`);
    console.log('Tabelas principais identificadas:');
    Object.keys(tables).forEach(tableName => {
        console.log(`  - ${tableName}`);
    });
    
    return tables;
}

// Executar análise
const tables = analyzeDumpStructure();

// Salvar resultado em arquivo JSON para análise posterior
fs.writeFileSync('./dump_analysis.json', JSON.stringify(tables, null, 2));
console.log('\nAnálise salva em dump_analysis.json'); 