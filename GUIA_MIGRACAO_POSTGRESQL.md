# 🚀 Guia Completo: Migração de Dados Legados MySQL → PostgreSQL

## 📋 Visão Geral

Este guia explica como migrar todos os dados legados do SaberCon (MySQL) para a nova plataforma Portal (PostgreSQL), aproveitando toda a estrutura já criada no projeto.

## ✅ O que já está pronto

- ✅ **Estrutura PostgreSQL** configurada
- ✅ **Migrations** criadas (52 tabelas mapeadas)
- ✅ **Seeds** de importação prontos
- ✅ **Script automatizado** de migração
- ✅ **Sistema de mapeamento** de IDs
- ✅ **Validação de integridade** automática

## 🔧 Pré-requisitos

### 1. Verificar Configuração do Banco
Certifique-se de que o PostgreSQL está configurado no arquivo `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_SSL=false
```

### 2. Verificar Pasta de Dumps
O script procura os dados em:
```
C:\Users\estev\OneDrive\Documentos\dumps\Dump20250601
```

### 3. Instalar Dependências
```bash
cd backend
npm install
```

## 🚀 Executar Migração (Método Simples)

### Comando Único
```bash
cd backend
npm run migrate:legados
```

Esse comando executa automaticamente:
1. ✅ Verificação de pré-requisitos
2. ✅ Execução das migrations
3. ✅ Importação dos dados principais
4. ✅ Importação dos vídeos e relacionamentos
5. ✅ Importação das estruturas complementares
6. ✅ Validação de integridade
7. ✅ Geração de relatório final

## 📊 O que será migrado

### Dados Principais (~15.000+ registros)
- **7.000+ Usuários** com perfis e permissões
- **500+ Vídeos** com metadados completos
- **100+ TV Shows** (séries educacionais)
- **1.000+ Arquivos** de mídia
- **50+ Instituições** educacionais
- **200+ Questões** e respostas
- **1.000+ Certificados**
- **10.000+ Status** de visualização

### Relacionamentos Preservados
- Usuários ↔ Instituições
- Vídeos ↔ Autores/Temas/Arquivos
- TV Shows ↔ Episódios
- Perfis ↔ Watchlists
- Questões ↔ Respostas

## 🔍 Monitoramento da Execução

Durante a migração, você verá:

```bash
🚀 Iniciando Migração Completa dos Dados Legados SaberCon → Portal
================================================================
📋 [28/01/2025 14:30:15] Iniciando: Verificação de Pré-requisitos
✅ [28/01/2025 14:30:16] ✓ Conexão com PostgreSQL estabelecida
✅ [28/01/2025 14:30:16] ✓ Pasta de dumps encontrada
✅ [28/01/2025 14:30:16] Concluído: Verificação de Pré-requisitos (0m 1s)

📋 [28/01/2025 14:30:16] Iniciando: Execução das Migrations
✅ [28/01/2025 14:30:18] ✓ Migrations executadas com sucesso
✅ [28/01/2025 14:30:18] Concluído: Execução das Migrations (0m 2s)

📋 [28/01/2025 14:30:18] Iniciando: Importação: Dados Principais
...
```

## ⏱️ Tempo Estimado

- **Pré-requisitos**: 1-2 minutos
- **Migrations**: 1-2 minutos  
- **Dados Principais**: 5-10 minutos
- **Vídeos**: 3-5 minutos
- **Complementares**: 5-10 minutos
- **Validação**: 2-3 minutos

**Total: 15-30 minutos**

## 📈 Validação Automática

O script automaticamente verifica:

✅ **Integridade dos dados**: Todas as tabelas principais têm dados
✅ **Relacionamentos**: Foreign keys funcionando
✅ **Mapeamentos**: IDs originais preservados
✅ **Contadores**: Estatísticas de cada tabela

## 📄 Relatório Final

Após a migração, será gerado um relatório detalhado:
```
relatorio-migracao-[timestamp].md
```

Contendo:
- ✅ Status de cada etapa
- 📊 Estatísticas de dados
- ⚠️ Avisos encontrados
- ❌ Erros (se houver)

## 🔧 Execução Manual (Avançado)

Se preferir executar passo a passo:

```bash
cd backend

# 1. Executar migrations
npm run migrate

# 2. Importar dados principais
npx knex seed:run --specific=006_sabercon_data_import.ts

# 3. Importar vídeos
npx knex seed:run --specific=007_sabercon_videos_import.ts

# 4. Importar estruturas complementares
npx knex seed:run --specific=008_sabercon_complete_import.ts
```

## 🚨 Solução de Problemas

### Problema: "Conexão recusada pelo banco"
**Solução**: Verificar se PostgreSQL está rodando e credenciais no `.env`

### Problema: "Pasta de dumps não encontrada"
**Solução**: Verificar se o caminho existe ou ajustar no script

### Problema: "Timeout na execução"
**Solução**: Aumentar timeout ou executar seeds individualmente

### Problema: "Chave duplicada"
**Solução**: Limpar banco e executar novamente:
```bash
npm run db:reset
npm run migrate:legados
```

## 🎯 Após a Migração

### 1. Verificar Dados
```sql
-- Contar registros principais
SELECT 'users' as tabela, COUNT(*) FROM users
UNION ALL SELECT 'videos', COUNT(*) FROM videos
UNION ALL SELECT 'tv_shows', COUNT(*) FROM tv_shows;

-- Verificar mapeamentos
SELECT table_name, COUNT(*) 
FROM sabercon_migration_mapping 
GROUP BY table_name;
```

### 2. Testar Funcionalidades
- Login de usuários migrados
- Reprodução de vídeos
- Navegação por séries
- Sistema de certificados

### 3. Configurar Backup
```bash
# Backup do banco migrado
pg_dump portal_sabercon > backup_pos_migracao.sql
```

## 🎉 Benefícios da Nova Estrutura

✅ **UUIDs** para melhor segurança
✅ **Estrutura normalizada** e otimizada  
✅ **Relacionamentos claros** entre entidades
✅ **Rastreabilidade completa** dos dados originais
✅ **Base sólida** para novas funcionalidades
✅ **Performance melhorada** com PostgreSQL

## 💡 Dicas Importantes

1. **Backup antes**: Sempre faça backup do banco atual
2. **Teste primeiro**: Execute em ambiente de desenvolvimento
3. **Monitore logs**: Acompanhe a execução para detectar problemas
4. **Valide após**: Confirme que os dados estão corretos
5. **Documente**: Anote qualquer customização necessária

---

## 🚀 Comando para Executar Agora

```bash
cd backend
npm run migrate:legados
```

**🎯 Em menos de 30 minutos, todos os seus dados legados estarão na nova plataforma PostgreSQL!**

---

*Este guia foi criado considerando toda a estrutura já implementada no projeto Portal. Para dúvidas ou problemas, consulte os logs de execução e o relatório gerado automaticamente.* 