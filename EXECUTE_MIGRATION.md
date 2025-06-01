# 🚀 Executar Migração Completa Sabercon → Portal

## ✅ Status da Migração
- **Total de arquivos analisados**: 52
- **Arquivos mapeados**: 34
- **Arquivos ignorados intencionalmente**: 18
- **Arquivos não processados**: 0
- **Cobertura**: 100%

**STATUS: ✅ PRONTO PARA EXECUÇÃO**

## 📋 Pré-requisitos

1. ✅ Pasta de dumps disponível em: `C:\Users\estev\OneDrive\Documentos\dumps\Dump20250601`
2. ✅ Migration criada: `backend/migrations/20250601000001_migrate_sabercon_data.ts`
3. ✅ Seeds criados:
   - `backend/seeds/006_sabercon_data_import.ts`
   - `backend/seeds/007_sabercon_videos_import.ts` 
   - `backend/seeds/008_sabercon_complete_import.ts`

## 🔄 Ordem de Execução

### Etapa 1: Executar Migration
```bash
cd backend
npx knex migrate:latest
```

### Etapa 2: Executar Seeds (OBRIGATÓRIO: nesta ordem)

#### 2.1 - Dados Principais (Fundação)
```bash
npx knex seed:run --specific=006_sabercon_data_import.ts
```
**Importa**: Roles, Instituições, Usuários, Autores, Gêneros, Tags, Temas, Target Audiences, Education Periods, Educational Stages, Files, TV Shows

#### 2.2 - Vídeos e Relacionamentos
```bash
npx knex seed:run --specific=007_sabercon_videos_import.ts
```
**Importa**: Vídeos e todos os relacionamentos de vídeo (arquivo, autor, tema, stage, period)

#### 2.3 - Estruturas Complementares
```bash
npx knex seed:run --specific=008_sabercon_complete_import.ts
```
**Importa**: School Units, School Classes, User Profiles, Questions, Answers, Certificates, Viewing Status, Watchlist, e todos os relacionamentos restantes

## ⏱️ Tempo Estimado de Execução

- **Migration**: ~1-2 minutos
- **Seed 006**: ~5-10 minutos (dados principais)
- **Seed 007**: ~3-5 minutos (vídeos)
- **Seed 008**: ~5-10 minutos (estruturas complementares)

**Total estimado**: 15-30 minutos

## 📊 Dados Esperados Após Migração

| Tabela | Registros Estimados |
|--------|-------------------|
| users | ~7.000+ |
| videos | ~500+ |
| tv_shows | ~100+ |
| media_files | ~1.000+ |
| institutions | ~50+ |
| questions | ~200+ |
| certificates | ~1.000+ |
| viewing_statuses | ~10.000+ |
| Relacionamentos | ~20.000+ |

## 🔍 Validação Pós-Migração

Execute estas queries para validar:

```sql
-- 1. Verificar contadores gerais
SELECT 'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'videos' as tabela, COUNT(*) as total FROM videos
UNION ALL
SELECT 'tv_shows' as tabela, COUNT(*) as total FROM tv_shows
UNION ALL
SELECT 'institutions' as tabela, COUNT(*) as total FROM institutions;

-- 2. Verificar mapeamentos
SELECT table_name, COUNT(*) as mappings 
FROM sabercon_migration_mapping 
GROUP BY table_name 
ORDER BY mappings DESC;

-- 3. Verificar integridade de relacionamentos
SELECT COUNT(*) as video_files_count FROM video_files;
SELECT COUNT(*) as video_authors_count FROM video_authors;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
```

## 🚨 Possíveis Problemas e Soluções

### Problema: "File not found"
**Solução**: Verificar se o caminho `C:\Users\estev\OneDrive\Documentos\dumps\Dump20250601` está correto

### Problema: "Foreign key constraint"
**Solução**: Executar os seeds na ordem correta (006 → 007 → 008)

### Problema: "Duplicate key"
**Solução**: Se reexecutar, limpar as tabelas primeiro:
```sql
TRUNCATE TABLE sabercon_migration_mapping CASCADE;
-- Depois limpar outras tabelas conforme necessário
```

## 📈 Monitoramento Durante Execução

Os seeds mostrarão progresso no console:
```
Iniciando importação dos dados principais do Sabercon...
Importando roles...
Importando instituições...
Importando usuários...
...
Importação concluída!
```

## ✅ Verificação de Sucesso

A migração foi bem-sucedida se:

1. ✅ Todas as migrations executaram sem erro
2. ✅ Todos os 3 seeds executaram sem erro  
3. ✅ Tabela `sabercon_migration_mapping` tem ~15.000+ registros
4. ✅ Tabelas principais têm dados (users, videos, tv_shows, etc.)
5. ✅ Relacionamentos foram criados corretamente

## 🎯 Próximos Passos Após Migração

1. **Testar funcionalidades** no frontend com dados migrados
2. **Ajustar queries** se necessário para nova estrutura
3. **Implementar validações** específicas para dados do Sabercon
4. **Configurar backup** dos dados migrados
5. **Documentar** qualquer customização adicional necessária

---

**🎉 BOA SORTE COM A MIGRAÇÃO!**

*Todos os dados do Sabercon estão mapeados e prontos para serem importados para a nova estrutura do Portal.* 