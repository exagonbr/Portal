@echo off
REM 🚀 Script de Migração Completa MySQL → PostgreSQL (Windows)
REM Este script executa a migração completa do banco de dados

echo 🚀 Iniciando migração completa MySQL → PostgreSQL...
echo ⚠️  ATENÇÃO: Este script irá APAGAR todos os dados existentes no PostgreSQL!
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Erro: Execute este script no diretório raiz do projeto
    pause
    exit /b 1
)

REM Verificar se o backend existe
if not exist "backend" (
    echo ❌ Erro: Diretório backend não encontrado
    pause
    exit /b 1
)

REM Entrar no diretório backend
cd backend
echo 📁 Entrando no diretório backend...

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas com sucesso!
)

REM Verificar conexão com PostgreSQL
echo 🔍 Verificando conexão com PostgreSQL...
call npm run db:check 2>nul || echo ⚠️  Não foi possível verificar conexão automaticamente

REM Aguardar confirmação do usuário
echo.
echo 🔄 Esta operação irá:
echo    1. ❌ APAGAR todas as tabelas existentes (DROP CASCADE)
echo    2. 🏗️  Criar nova estrutura PostgreSQL completa
echo    3. 🌱 Inserir dados básicos (roles, instituições, etc.)
echo.
set /p confirm=Deseja continuar? (s/N): 

if /i not "%confirm%"=="s" (
    echo ❌ Operação cancelada pelo usuário
    pause
    exit /b 1
)

echo.
echo 🧹 PASSO 1: Executando migração (DROP CASCADE + CREATE)...

REM Executar a migração
call npm run migrate:latest
if errorlevel 1 (
    echo ❌ Erro ao executar migração
    pause
    exit /b 1
)
echo ✅ Migração executada com sucesso!

echo.
echo 🌱 PASSO 2: Executando seed (dados básicos)...

REM Executar o seed
call npm run seed:run
if errorlevel 1 (
    echo ❌ Erro ao executar seed
    pause
    exit /b 1
)
echo ✅ Seed executado com sucesso!

echo.
echo 🎉 MIGRAÇÃO COMPLETA CONCLUÍDA COM SUCESSO!
echo.
echo 📊 RESUMO:
echo   ✅ Estrutura PostgreSQL criada
echo   ✅ Dados básicos inseridos
echo   ✅ Sistema pronto para uso
echo.
echo 🔗 Próximos passos:
echo   1. 🌐 Acesse a interface web de migração
echo   2. 📥 Configure conexão MySQL
echo   3. 🔄 Execute migração de dados
echo   4. ✅ Valide os dados migrados
echo.
echo 📱 Interface de migração disponível em:
echo   → http://localhost:3000/admin/migration/mysql-postgres
echo.
echo 👤 Para acessar como administrador:
echo   → Role: SYSTEM_ADMIN
echo   → ID: 35f57500-9a89-4318-bc9f-9acad28c2fb6
echo.

REM Voltar ao diretório raiz
cd ..

echo 🎯 Migração preparada com sucesso!
echo    Use a interface web para importar dados do MySQL.
echo.
pause
