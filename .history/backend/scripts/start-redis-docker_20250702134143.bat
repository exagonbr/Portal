@echo off
REM Script para iniciar Redis com Docker no Windows
REM Útil para desenvolvimento local

echo 🐳 Iniciando Redis com Docker...

REM Verifica se o Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado. Instale o Docker primeiro.
    echo 📦 Baixe em: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Para qualquer instância existente do Redis
echo 🛑 Parando instâncias existentes do Redis...
docker stop redis-portal >nul 2>&1
docker rm redis-portal >nul 2>&1

REM Inicia nova instância do Redis
echo 🚀 Iniciando nova instância do Redis...
docker run -d --name redis-portal -p 6379:6379 --restart unless-stopped redis:alpine redis-server --appendonly yes

REM Verifica se iniciou corretamente
timeout /t 3 /nobreak >nul
docker ps | findstr redis-portal >nul
if %errorlevel% equ 0 (
    echo ✅ Redis iniciado com sucesso!
    echo 🔗 Conectado na porta 6379
    echo 📊 Para verificar logs: docker logs redis-portal
    echo 🛑 Para parar: docker stop redis-portal
    echo.
    echo 🧪 Para testar a conexão, execute: npm run check:redis
) else (
    echo ❌ Erro ao iniciar Redis
    docker logs redis-portal
    pause
    exit /b 1
)

pause 