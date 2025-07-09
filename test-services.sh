#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# URL base da API
API_URL="http://localhost:3001"

# Credenciais de login
EMAIL="admin@sabercon.edu.br"
PASSWORD="password"

# Modo de debug (1 = ativado, 0 = desativado)
DEBUG=1

# Função para exibir mensagens
log_info() {
  echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
  if [ $DEBUG -eq 1 ]; then
    echo -e "${YELLOW}[DEBUG]${NC} $1"
  fi
}

# Função para testar um endpoint
test_endpoint() {
  local endpoint=$1
  local method=${2:-GET}
  local data=$3
  local description=${4:-"Testando $endpoint"}
  
  log_info "$description"
  
  # Mostrar detalhes da requisição em modo debug
  if [ $DEBUG -eq 1 ]; then
    log_debug "Método: $method"
    log_debug "URL: $API_URL$endpoint"
    log_debug "Authorization: Bearer $TOKEN"
    if [ "$method" != "GET" ]; then
      log_debug "Dados: $data"
    fi
  fi
  
  if [ "$method" == "GET" ]; then
    response=$(curl -v -s -X $method -H "Authorization: Bearer $TOKEN" "$API_URL$endpoint" 2>&1)
  else
    response=$(curl -v -s -X $method -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint" 2>&1)
  fi
  
  # Verificar se a resposta está vazia
  if [ -z "$response" ]; then
    log_error "Resposta vazia - o servidor pode não estar respondendo"
    return 1
  fi
  
  # Exibir resposta completa em modo debug
  if [ $DEBUG -eq 1 ]; then
    log_debug "Resposta completa:"
    echo "$response"
  else
    # Exibir resposta resumida (primeiros 150 caracteres)
    echo "Resposta: ${response:0:150}..."
  fi
  
  # Verificar se a resposta contém "error", "Error" ou "success":false
  if echo "$response" | grep -q -i "error" || echo "$response" | grep -q '"success":false'; then
    log_error "Falha!"
    return 1
  else
    log_success "Sucesso!"
    return 0
  fi
}

# Verificar se o servidor está rodando
log_info "Verificando se o servidor está rodando em $API_URL"
server_check=$(curl -s -m 5 "$API_URL/health" || echo "Falha na conexão")

if [[ $server_check == *"Falha na conexão"* ]]; then
  log_error "Não foi possível conectar ao servidor em $API_URL"
  log_info "Tentando continuar mesmo assim..."
else
  log_success "Servidor está respondendo!"
  echo "Resposta do health check: $server_check"
fi

# Fazer login e obter token
log_info "Fazendo login como $EMAIL"
login_response=$(curl -v -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "$API_URL/api/auth/login" 2>&1)

echo "Resposta do login (completa):"
echo "$login_response"

# Extrair token do JSON de resposta - formato correto para a resposta atual
TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
  log_error "Falha ao obter token de autenticação."
  
  # Tentar extrair o token de outra forma
  log_info "Tentando extrair o token de outra forma..."
  TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  
  if [ -z "$TOKEN" ]; then
    log_error "Todas as tentativas de extrair o token falharam."
    log_error "Não é possível continuar os testes sem um token válido."
    exit 1
  fi
fi

log_success "Login bem-sucedido! Token obtido."
# Mostrar parte do token para verificação
echo "Token (primeiros 30 caracteres): ${TOKEN:0:30}..."

# Testar apenas alguns serviços principais para diagnóstico
echo ""
log_info "Iniciando testes dos serviços (modo diagnóstico)..."
echo ""

# Testar apenas alguns serviços principais
test_endpoint "/api/institutions" "GET" "" "Testando serviço de instituições (institutionService)"
test_endpoint "/api/roles" "GET" "" "Testando serviço de roles (roleService)"
test_endpoint "/api/users" "GET" "" "Testando serviço de usuários (userService)"

echo ""
log_info "Testes concluídos!" 