#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

log_section() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Função para mostrar o menu
show_menu() {
  echo -e "\n${CYAN}🚀 PORTAL EDUCACIONAL - TESTES DE API${NC}"
  echo -e "${CYAN}=======================================${NC}"
  echo ""
  echo "Escolha uma opção:"
  echo ""
  echo "1) 📋 Testes de Leitura (GET) - Todas as rotas"
  echo "2) ✏️  Testes CRUD (CREATE, READ, UPDATE, DELETE)"
  echo "3) 🔄 Executar TODOS os testes"
  echo "4) ❌ Sair"
  echo ""
  echo -n "Digite sua escolha [1-4]: "
}

# Função para executar testes de leitura
run_read_tests() {
  log_section "EXECUTANDO TESTES DE LEITURA"
  log_info "Testando todas as rotas GET da API..."
  
  if [ -f "./test-services.sh" ]; then
    ./test-services.sh
    return $?
  else
    log_error "Arquivo test-services.sh não encontrado!"
    return 1
  fi
}

# Função para executar testes CRUD
run_crud_tests() {
  log_section "EXECUTANDO TESTES CRUD"
  log_info "Testando operações CREATE, READ, UPDATE, DELETE..."
  
  if [ -f "./test-crud-services.sh" ]; then
    ./test-crud-services.sh
    return $?
  else
    log_error "Arquivo test-crud-services.sh não encontrado!"
    return 1
  fi
}

# Função para executar todos os testes
run_all_tests() {
  log_section "EXECUTANDO TODOS OS TESTES"
  
  local total_errors=0
  
  # Executar testes de leitura
  log_info "Fase 1: Testes de Leitura"
  run_read_tests
  if [ $? -ne 0 ]; then
    total_errors=$((total_errors + 1))
    log_error "Testes de leitura falharam!"
  else
    log_success "Testes de leitura concluídos com sucesso!"
  fi
  
  echo ""
  log_info "Aguardando 3 segundos antes da próxima fase..."
  sleep 3
  
  # Executar testes CRUD
  log_info "Fase 2: Testes CRUD"
  run_crud_tests
  if [ $? -ne 0 ]; then
    total_errors=$((total_errors + 1))
    log_error "Testes CRUD falharam!"
  else
    log_success "Testes CRUD concluídos com sucesso!"
  fi
  
  # Resultado final
  echo ""
  log_section "RESULTADO FINAL"
  if [ $total_errors -eq 0 ]; then
    log_success "🎉 Todos os testes foram executados com sucesso!"
    return 0
  else
    log_error "⚠️  $total_errors fase(s) de teste falharam. Verifique os logs acima."
    return 1
  fi
}

# Verificar se os scripts existem
check_scripts() {
  local missing_scripts=0
  
  if [ ! -f "./test-services.sh" ]; then
    log_error "Script test-services.sh não encontrado!"
    missing_scripts=$((missing_scripts + 1))
  fi
  
  if [ ! -f "./test-crud-services.sh" ]; then
    log_error "Script test-crud-services.sh não encontrado!"
    missing_scripts=$((missing_scripts + 1))
  fi
  
  if [ $missing_scripts -gt 0 ]; then
    log_error "Certifique-se de que todos os scripts estão no diretório atual."
    exit 1
  fi
}

# Verificar se os scripts são executáveis
check_permissions() {
  if [ ! -x "./test-services.sh" ]; then
    log_info "Tornando test-services.sh executável..."
    chmod +x ./test-services.sh 2>/dev/null || sudo chmod +x ./test-services.sh
  fi
  
  if [ ! -x "./test-crud-services.sh" ]; then
    log_info "Tornando test-crud-services.sh executável..."
    chmod +x ./test-crud-services.sh 2>/dev/null || sudo chmod +x ./test-crud-services.sh
  fi
}

# Função principal
main() {
  # Verificações iniciais
  check_scripts
  check_permissions
  
  # Se argumentos foram passados, executar diretamente
  if [ $# -gt 0 ]; then
    case $1 in
      "read"|"1")
        run_read_tests
        exit $?
        ;;
      "crud"|"2")
        run_crud_tests
        exit $?
        ;;
      "all"|"3")
        run_all_tests
        exit $?
        ;;
      *)
        echo "Uso: $0 [read|crud|all]"
        echo "  read - Executar apenas testes de leitura"
        echo "  crud - Executar apenas testes CRUD"
        echo "  all  - Executar todos os testes"
        exit 1
        ;;
    esac
  fi
  
  # Menu interativo
  while true; do
    show_menu
    read -r choice
    
    case $choice in
      1)
        run_read_tests
        ;;
      2)
        run_crud_tests
        ;;
      3)
        run_all_tests
        ;;
      4)
        log_info "Saindo..."
        exit 0
        ;;
      *)
        log_error "Opção inválida! Por favor, escolha 1-4."
        ;;
    esac
    
    echo ""
    echo "Pressione Enter para continuar..."
    read -r
  done
}

# Executar função principal
main "$@" 