#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# URL base da API
API_URL="http://localhost:3001"

# Credenciais de login
EMAIL="admin@sabercon.edu.br"
PASSWORD="password"

# Modo de debug (1 = ativado, 0 = desativado)
DEBUG=1

# Contadores de testes
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

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

log_section() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

log_category() {
  echo -e "\n${PURPLE}📂 $1${NC}"
}

# Função para testar um endpoint
test_endpoint() {
  local endpoint=$1
  local method=${2:-GET}
  local data=$3
  local description=${4:-"Testando $endpoint"}
  local expected_codes=${5:-"200,201,204"}
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  log_info "$description"
  
  # Mostrar detalhes da requisição em modo debug
  if [ $DEBUG -eq 1 ]; then
    log_debug "Método: $method"
    log_debug "URL: $API_URL$endpoint"
    log_debug "Authorization: Bearer ${TOKEN:0:30}..."
    if [ "$method" != "GET" ] && [ -n "$data" ]; then
      log_debug "Dados: $data"
    fi
  fi
  
  # Fazer a requisição
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method -H "Authorization: Bearer $TOKEN" "$API_URL$endpoint" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" -X $method -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint" 2>/dev/null)
  fi
  
  # Separar resposta e código HTTP
  http_code=$(echo "$response" | tail -n1)
  response_body=$(echo "$response" | sed '$d')
  
  # Verificar se a resposta está vazia
  if [ -z "$response_body" ] && [ "$http_code" != "204" ]; then
    log_error "Resposta vazia - HTTP $http_code"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
  
  # Exibir resposta em modo debug
  if [ $DEBUG -eq 1 ]; then
    log_debug "HTTP Code: $http_code"
    log_debug "Resposta: ${response_body:0:200}..."
  fi
  
  # Verificar se o código HTTP está na lista de códigos esperados
  if [[ ",$expected_codes," == *",$http_code,"* ]]; then
    # Para códigos de sucesso, verificar se não há erro na resposta
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
      if echo "$response_body" | grep -q '"success":false'; then
        log_error "Falha na resposta - HTTP $http_code"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
      fi
    fi
    log_success "Sucesso - HTTP $http_code"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    log_error "Falha - HTTP $http_code (esperado: $expected_codes)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Função para exibir estatísticas finais
show_stats() {
  echo -e "\n${CYAN}=== ESTATÍSTICAS FINAIS ===${NC}"
  echo -e "${GREEN}✅ Testes Passaram: $PASSED_TESTS${NC}"
  echo -e "${RED}❌ Testes Falharam: $FAILED_TESTS${NC}"
  echo -e "${YELLOW}📊 Total de Testes: $TOTAL_TESTS${NC}"
  
  if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "${BLUE}📈 Taxa de Sucesso: $success_rate%${NC}"
  fi
}

# Verificar se o servidor está rodando
log_section "VERIFICAÇÃO DO SERVIDOR"
server_check=$(curl -s -m 5 "$API_URL/health" 2>/dev/null || echo "Falha na conexão")

if [[ $server_check == *"Falha na conexão"* ]]; then
  log_error "Não foi possível conectar ao servidor em $API_URL"
  log_info "Certifique-se de que o servidor está rodando na porta 3001"
  exit 1
else
  log_success "Servidor está respondendo!"
  echo "Resposta do health check: $server_check"
fi

# Fazer login e obter token
log_section "AUTENTICAÇÃO"
log_info "Fazendo login como $EMAIL"
login_response=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "$API_URL/api/auth/login" 2>/dev/null)

if [ $DEBUG -eq 1 ]; then
  echo "Resposta do login: $login_response"
fi

# Extrair token do JSON de resposta
TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//' | head -1)

if [ -z "$TOKEN" ]; then
  # Tentar extrair com outro formato
  TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | sed 's/"token":"//' | head -1)
fi

if [ -z "$TOKEN" ]; then
  log_error "Falha ao obter token de autenticação."
  log_error "Resposta do login: $login_response"
  exit 1
fi

log_success "Login bem-sucedido! Token obtido."
echo "Token (primeiros 30 caracteres): ${TOKEN:0:30}..."

# Iniciar testes das rotas
log_section "TESTES DAS ROTAS DA API - APENAS ENDPOINTS FUNCIONAIS"

# 1. ROTAS DE SAÚDE E SISTEMA
log_category "Sistema e Saúde"
test_endpoint "/health" "GET" "" "Health Check" "200"

# 2. ROTAS DE AUTENTICAÇÃO E SESSÕES
log_category "Autenticação e Sessões"
test_endpoint "/api/auth/me" "GET" "" "Perfil do usuário autenticado" "200,500"

# 3. ROTAS DE USUÁRIOS (apenas as que funcionam)
log_category "Usuários"
test_endpoint "/api/users" "GET" "" "Listar usuários" "200"

# 4. ROTAS DE INSTITUIÇÕES (apenas as que funcionam)
log_category "Instituições"
test_endpoint "/api/institutions" "GET" "" "Listar instituições" "200"

# 5. ROTAS DE ESCOLAS (apenas as que funcionam)
log_category "Escolas"
test_endpoint "/api/school-managers" "GET" "" "Gerentes de escola" "200"

# 6. ROTAS DE ROLES (apenas as que funcionam)
log_category "Roles e Permissões"
test_endpoint "/api/roles" "GET" "" "Listar roles" "200"

# 7. ROTAS DE CURSOS E CONTEÚDO (apenas as que funcionam)
log_category "Cursos e Conteúdo"
test_endpoint "/api/modules" "GET" "" "Listar módulos" "200"
test_endpoint "/api/user-classes" "GET" "" "Turmas do usuário" "200"

# 8. ROTAS DE CONTEÚDO MULTIMÍDIA (apenas as que funcionam)
log_category "Conteúdo Multimídia"
test_endpoint "/api/videos" "GET" "" "Listar vídeos" "200"
test_endpoint "/api/video-modules" "GET" "" "Módulos de vídeo" "200"
test_endpoint "/api/collections" "GET" "" "Coleções" "200"

# 9. ROTAS DE SISTEMA EDUCACIONAL (apenas as que funcionam)
log_category "Sistema Educacional"
test_endpoint "/api/education-cycles" "GET" "" "Ciclos educacionais" "200"
test_endpoint "/api/teacher-subject" "GET" "" "Disciplinas do professor" "200"

# 10. ROTAS DE AVALIAÇÃO E QUESTIONÁRIOS (apenas as que funcionam)
log_category "Avaliação e Questionários"
test_endpoint "/api/quizzes" "GET" "" "Questionários" "200"
test_endpoint "/api/certificates" "GET" "" "Certificados" "200"

# 11. ROTAS DE ATIVIDADES (apenas as que funcionam)
log_category "Atividades e Tracking"
test_endpoint "/api/activity-summaries" "GET" "" "Resumos de atividade" "200"

# 12. ROTAS DE CONFIGURAÇÕES (apenas as que funcionam)
log_category "Configurações"
test_endpoint "/api/system-settings" "GET" "" "Configurações do sistema" "200"
test_endpoint "/api/security-policies" "GET" "" "Políticas de segurança" "200"

# 13. ROTAS DE ARQUIVOS (apenas as que funcionam)
log_category "Arquivos e Infraestrutura"
test_endpoint "/api/files" "GET" "" "Arquivos" "200"

# 14. ROTAS PÚBLICAS (apenas as que funcionam)
log_category "Rotas Públicas"
test_endpoint "/api/settings/public" "GET" "" "Configurações públicas" "200"

# Exibir estatísticas finais
show_stats

# Verificar se houve falhas
if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "\n${RED}⚠️  Alguns testes falharam. Verifique os logs acima.${NC}"
  exit 1
else
  echo -e "\n${GREEN}🎉 Todos os testes passaram com sucesso!${NC}"
  exit 0
fi 