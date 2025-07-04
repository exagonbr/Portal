@echo off
echo [94m===========================================[0m
echo [94m   SCRIPT DE RESET DO BANCO DE DADOS[0m
echo [94m===========================================[0m

:: Configurações do banco
set DB_NAME=portal_sabercon
set DB_USER=postgres
set DB_PASS=root
set BACKUP_DIR=database\dumps
set TIMESTAMP=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_FILE=%BACKUP_DIR%\backup_%TIMESTAMP%.sql

:: Verificar se o PostgreSQL está acessível
echo.
echo [93mVerificando conexão com PostgreSQL...[0m
psql -U %DB_USER% -d postgres -c "\q" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [91mERRO: Não foi possível conectar ao PostgreSQL.[0m
    echo [91mVerifique se:[0m
    echo [91m1. PostgreSQL está instalado e rodando[0m
    echo [91m2. Usuário %DB_USER% existe[0m
    echo [91m3. Senha está correta (atual: %DB_PASS%)[0m
    exit /b 1
)
echo [92m✓ PostgreSQL conectado com sucesso[0m

echo.
echo [93m1. Criando diretório de backup se não existir...[0m
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%
echo [92m✓ Diretório de backup verificado[0m

echo.
echo [93m2. Fazendo backup do banco atual (se existir)...[0m
pg_dump -U %DB_USER% %DB_NAME% > %BACKUP_FILE% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [92m✓ Backup criado em %BACKUP_FILE%[0m
) else (
    echo [93m! Banco não existe ou erro no backup - continuando...[0m
)

echo.
echo [93m3. Dropando conexões existentes...[0m
psql -U %DB_USER% -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '%DB_NAME%' AND pid <> pg_backend_pid();" >nul 2>&1
echo [92m✓ Conexões finalizadas[0m

echo.
echo [93m4. Dropando banco de dados se existir...[0m
psql -U %DB_USER% -d postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;" >nul 2>&1
echo [92m✓ Banco removido (se existia)[0m

echo.
echo [93m5. Criando banco de dados...[0m
psql -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [92m✓ Banco criado com sucesso[0m
) else (
    echo [91m✗ Erro ao criar banco[0m
    exit /b 1
)

echo.
echo [93m6. Executando migrações...[0m
call npx knex migrate:latest
if %ERRORLEVEL% EQU 0 (
    echo [92m✓ Migrações executadas com sucesso[0m
) else (
    echo [91m✗ Erro ao executar migrações[0m
    exit /b 1
)

echo.
echo [93m7. Executando seeds...[0m
call npx knex seed:run --specific=001_test_seed.js
if %ERRORLEVEL% EQU 0 (
    echo [92m✓ Seeds executados com sucesso[0m
) else (
    echo [91m✗ Erro ao executar seeds[0m
    exit /b 1
)

echo.
echo [92m===========================================[0m
echo [92m   BANCO DE DADOS RESETADO COM SUCESSO![0m
echo [92m===========================================[0m
echo.
echo [94mBackup do banco anterior:[0m %BACKUP_FILE%
echo [94mBanco de dados:[0m %DB_NAME%
echo [94mUsuário admin:[0m admin@sabercon.edu.br
echo [94mSenha:[0m password123
echo.

pause