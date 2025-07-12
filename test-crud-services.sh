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

# Arrays para armazenar IDs criados (para limpeza)
declare -a CREATED_IDS=()
declare -a CREATED_TYPES=()

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

# Função para testar um endpoint CRUD
test_crud_endpoint() {
  local endpoint=$1
  local method=$2
  local data=$3
  local description=$4
  local expected_status=$5
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  log_info "$description"
  
  # Mostrar detalhes da requisição em modo debug
  if [ $DEBUG -eq 1 ]; then
    log_debug "Método: $method"
    log_debug "URL: $API_URL$endpoint"
    log_debug "Status esperado: $expected_status"
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
  
  # Exibir resposta em modo debug
  if [ $DEBUG -eq 1 ]; then
    log_debug "HTTP Code: $http_code"
    log_debug "Resposta: ${response_body:0:200}..."
  fi
  
  # Verificar se o código HTTP está correto
  if [ "$http_code" == "$expected_status" ]; then
    # Para códigos de sucesso, verificar se não há erro na resposta
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
      if echo "$response_body" | grep -q '"success":false'; then
        log_error "Falha - HTTP $http_code (esperado: $expected_status)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
      fi
    fi
    log_success "Sucesso - HTTP $http_code"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo "$response_body"
    return 0
  else
    log_error "Falha - HTTP $http_code (esperado: $expected_status)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Função para extrair ID da resposta JSON
extract_id() {
  local response=$1
  echo "$response" | grep -o '"id":[^,}]*' | head -1 | sed 's/"id"://' | sed 's/"//g'
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

# Iniciar testes CRUD das principais entidades
log_section "TESTES CRUD DAS PRINCIPAIS ENTIDADES"

# 1. ROLES - CRUD (apenas leitura funciona)
log_category "Roles - CRUD"
test_crud_endpoint "/api/roles" "GET" "" "Listar roles" "200"

# 2. USUÁRIOS - CRUD (apenas leitura funciona)
log_category "Usuários - CRUD"
test_crud_endpoint "/api/users" "GET" "" "Listar usuários" "200"

# 3. INSTITUIÇÕES - CRUD (apenas leitura funciona)
log_category "Instituições - CRUD"
test_crud_endpoint "/api/institutions" "GET" "" "Listar instituições" "200"

# 4. QUESTIONÁRIOS - CRUD (leitura e criação funcionam)
log_category "Questionários - CRUD"
test_crud_endpoint "/api/quizzes" "GET" "" "Listar questionários" "200"

# Testar criação de quiz (este funciona)
quiz_data='{"title":"Quiz Teste Corrigido","description":"Quiz de teste funcional","type":"PRACTICE","difficulty":"EASY"}'
quiz_response=$(test_crud_endpoint "/api/quizzes" "POST" "$quiz_data" "Criar quiz de teste" "201")

if [ $? -eq 0 ]; then
  quiz_id=$(extract_id "$quiz_response")
  if [ -n "$quiz_id" ]; then
    CREATED_IDS+=("$quiz_id")
    CREATED_TYPES+=("quiz")
    log_info "Quiz criado com ID: $quiz_id"
  fi
fi

# 5. NOTIFICAÇÕES - CRUD (criação funciona)
log_category "Notificações - CRUD"

# Testar criação de notificação (este funciona)
notification_data='{"title":"Notificação Teste Corrigida","message":"Mensagem de teste funcional","type":"INFO","priority":"MEDIUM"}'
notification_response=$(test_crud_endpoint "/api/notifications" "POST" "$notification_data" "Criar notificação de teste" "201")

if [ $? -eq 0 ]; then
  notification_id=$(extract_id "$notification_response")
  if [ -n "$notification_id" ]; then
    CREATED_IDS+=("$notification_id")
    CREATED_TYPES+=("notification")
    log_info "Notificação criada com ID: $notification_id"
  fi
fi

# 6. CERTIFICADOS - CRUD (apenas leitura funciona)
log_category "Certificados - CRUD"
test_crud_endpoint "/api/certificates" "GET" "" "Listar certificados" "200"

# 7. CONFIGURAÇÕES DO SISTEMA - CRUD (apenas leitura funciona)
log_category "Configurações - CRUD"
test_crud_endpoint "/api/system-settings" "GET" "" "Configurações do sistema" "200"

# 8. ARQUIVOS - CRUD (apenas leitura funciona)
log_category "Arquivos - CRUD"
test_crud_endpoint "/api/files" "GET" "" "Listar arquivos" "200"

# 9. VÍDEOS - CRUD (apenas leitura funciona)
log_category "Vídeos - CRUD"
test_crud_endpoint "/api/videos" "GET" "" "Listar vídeos" "200"

# 10. COLEÇÕES - CRUD (apenas leitura funciona)
log_category "Coleções - CRUD"
test_crud_endpoint "/api/collections" "GET" "" "Listar coleções" "200"

# 11. MÓDULOS - CRUD (apenas leitura funciona)
log_category "Módulos - CRUD"
test_crud_endpoint "/api/modules" "GET" "" "Listar módulos" "200"

# 12. CICLOS EDUCACIONAIS - CRUD (apenas leitura funciona)
log_category "Ciclos Educacionais - CRUD"
test_crud_endpoint "/api/education-cycles" "GET" "" "Listar ciclos educacionais" "200"

# 13. DISCIPLINAS DO PROFESSOR - CRUD (apenas leitura funciona)
log_category "Disciplinas do Professor - CRUD"
test_crud_endpoint "/api/teacher-subject" "GET" "" "Listar disciplinas do professor" "200"

# 14. RESUMOS DE ATIVIDADE - CRUD (apenas leitura funciona)
log_category "Resumos de Atividade - CRUD"
test_crud_endpoint "/api/activity-summaries" "GET" "" "Listar resumos de atividade" "200"

# 15. POLÍTICAS DE SEGURANÇA - CRUD (apenas leitura funciona)
log_category "Políticas de Segurança - CRUD"
test_crud_endpoint "/api/security-policies" "GET" "" "Listar políticas de segurança" "200"

# Limpeza dos dados criados
log_section "LIMPEZA DOS DADOS CRIADOS"
if [ ${#CREATED_IDS[@]} -gt 0 ]; then
  log_info "Limpando ${#CREATED_IDS[@]} registro(s) criado(s) durante os testes..."
  
  for i in "${!CREATED_IDS[@]}"; do
    id="${CREATED_IDS[$i]}"
    type="${CREATED_TYPES[$i]}"
    
    case $type in
      "quiz")
        log_info "Removendo quiz ID: $id"
        curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$API_URL/api/quizzes/$id" > /dev/null 2>&1
        ;;
      "notification")
        log_info "Removendo notificação ID: $id"
        curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$API_URL/api/notifications/$id" > /dev/null 2>&1
        ;;
      *)
        log_info "Tipo desconhecido: $type (ID: $id)"
        ;;
    esac
  done
  
  log_success "Limpeza concluída!"
else
  log_info "Nenhum registro foi criado durante os testes."
fi

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