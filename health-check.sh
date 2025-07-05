#!/bin/bash

# Script de Verificação de Saúde - Portal Sabercon
# Verifica se todos os componentes estão funcionando corretamente
# Uso: bash health-check.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Configurações
DOMAIN="portal.sabercon.com.br"
FRONTEND_PORT="3000"
BACKEND_PORT="3001"

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Função para log
log_check() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -e "${BLUE}[CHECK $TOTAL_CHECKS] $1${NC}"
}

log_pass() {
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo -e "${GREEN}✅ PASS: $1${NC}"
}

log_fail() {
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo -e "${RED}❌ FAIL: $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
}

log_info() {
    echo -e "${CYAN}ℹ️  INFO: $1${NC}"
}

print_header() {
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}🏥 $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Header principal
clear
print_header "PORTAL SABERCON - VERIFICAÇÃO DE SAÚDE"
echo ""
log_info "🌐 Domínio: $DOMAIN"
log_info "📱 Frontend: localhost:$FRONTEND_PORT"
log_info "🔧 Backend: localhost:$BACKEND_PORT"
log_info "⏰ Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. Verificar processos PM2
log_check "Verificando processos PM2..."
if command -v pm2 >/dev/null 2>&1; then
    PM2_STATUS=$(pm2 jlist 2>/dev/null || echo "[]")
    
    if echo "$PM2_STATUS" | grep -q "PortalServerFrontend"; then
        FRONTEND_STATUS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="PortalServerFrontend") | .pm2_env.status' 2>/dev/null || echo "unknown")
        if [ "$FRONTEND_STATUS" = "online" ]; then
            log_pass "Frontend PM2 está online"
        else
            log_fail "Frontend PM2 status: $FRONTEND_STATUS"
        fi
    else
        log_fail "Frontend PM2 não encontrado"
    fi
    
    if echo "$PM2_STATUS" | grep -q "PortalServerBackend"; then
        BACKEND_STATUS=$(echo "$PM2_STATUS" | jq -r '.[] | select(.name=="PortalServerBackend") | .pm2_env.status' 2>/dev/null || echo "unknown")
        if [ "$BACKEND_STATUS" = "online" ]; then
            log_pass "Backend PM2 está online"
        else
            log_fail "Backend PM2 status: $BACKEND_STATUS"
        fi
    else
        log_fail "Backend PM2 não encontrado"
    fi
else
    log_fail "PM2 não está instalado"
fi
echo ""

# 2. Verificar portas
log_check "Verificando portas das aplicações..."
if netstat -tlnp 2>/dev/null | grep ":$FRONTEND_PORT " >/dev/null; then
    log_pass "Frontend porta $FRONTEND_PORT está aberta"
else
    log_fail "Frontend porta $FRONTEND_PORT não está aberta"
fi

if netstat -tlnp 2>/dev/null | grep ":$BACKEND_PORT " >/dev/null; then
    log_pass "Backend porta $BACKEND_PORT está aberta"
else
    log_fail "Backend porta $BACKEND_PORT não está aberta"
fi
echo ""

# 3. Verificar resposta HTTP local
log_check "Verificando resposta HTTP local..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$FRONTEND_PORT --connect-timeout 5 | grep -q "200\|301\|302"; then
    log_pass "Frontend respondendo HTTP localmente"
else
    log_fail "Frontend não está respondendo HTTP localmente"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT --connect-timeout 5 | grep -q "200\|404"; then
    log_pass "Backend respondendo HTTP localmente"
else
    log_fail "Backend não está respondendo HTTP localmente"
fi
echo ""

# 4. Verificar Nginx
log_check "Verificando Nginx..."
if systemctl is-active --quiet nginx 2>/dev/null; then
    log_pass "Nginx está ativo"
    
    # Testar configuração
    if nginx -t >/dev/null 2>&1; then
        log_pass "Configuração Nginx válida"
    else
        log_fail "Configuração Nginx inválida"
    fi
else
    log_fail "Nginx não está ativo"
fi
echo ""

# 5. Verificar SSL/HTTPS
log_check "Verificando SSL/HTTPS..."
if curl -s -I https://$DOMAIN --connect-timeout 10 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
    log_pass "HTTPS respondendo para $DOMAIN"
    
    # Verificar certificado
    if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep -q "notAfter"; then
        CERT_EXPIRY=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
        log_pass "Certificado SSL válido (expira: $CERT_EXPIRY)"
    else
        log_warn "Não foi possível verificar certificado SSL"
    fi
else
    log_fail "HTTPS não está respondendo para $DOMAIN"
fi
echo ""

# 6. Verificar banco de dados
log_check "Verificando PostgreSQL..."
if systemctl is-active --quiet postgresql 2>/dev/null; then
    log_pass "PostgreSQL está ativo"
    
    # Testar conexão (se possível)
    if command -v psql >/dev/null 2>&1; then
        if psql -h localhost -U postgres -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
            log_pass "Conexão PostgreSQL funcionando"
        else
            log_warn "Não foi possível testar conexão PostgreSQL (pode precisar de credenciais)"
        fi
    else
        log_info "psql não disponível para teste de conexão"
    fi
else
    log_fail "PostgreSQL não está ativo"
fi
echo ""

# 7. Verificar Redis (se disponível)
log_check "Verificando Redis..."
if systemctl is-active --quiet redis 2>/dev/null || systemctl is-active --quiet redis-server 2>/dev/null; then
    log_pass "Redis está ativo"
    
    # Testar conexão
    if command -v redis-cli >/dev/null 2>&1; then
        if redis-cli ping 2>/dev/null | grep -q "PONG"; then
            log_pass "Conexão Redis funcionando"
        else
            log_warn "Redis não está respondendo ao ping"
        fi
    else
        log_info "redis-cli não disponível para teste"
    fi
else
    log_info "Redis não está ativo (opcional)"
fi
echo ""

# 8. Verificar uso de recursos
log_check "Verificando uso de recursos..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')

if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
    log_pass "Uso de memória: ${MEMORY_USAGE}%"
else
    log_warn "Alto uso de memória: ${MEMORY_USAGE}%"
fi

if [ "$DISK_USAGE" -lt 80 ]; then
    log_pass "Uso de disco: ${DISK_USAGE}%"
else
    log_warn "Alto uso de disco: ${DISK_USAGE}%"
fi

if (( $(echo "$LOAD_AVG < 2.0" | bc -l) )); then
    log_pass "Load average: $LOAD_AVG"
else
    log_warn "Alto load average: $LOAD_AVG"
fi
echo ""

# 9. Verificar logs recentes
log_check "Verificando logs recentes..."
ERROR_COUNT=0

# Logs do Nginx
if [ -f "/var/log/nginx/error.log" ]; then
    NGINX_ERRORS=$(tail -100 /var/log/nginx/error.log 2>/dev/null | grep "$(date '+%Y/%m/%d')" | wc -l)
    if [ "$NGINX_ERRORS" -lt 10 ]; then
        log_pass "Nginx errors hoje: $NGINX_ERRORS"
    else
        log_warn "Muitos erros Nginx hoje: $NGINX_ERRORS"
        ERROR_COUNT=$((ERROR_COUNT + NGINX_ERRORS))
    fi
fi

# Logs PM2
if [ -f "./logs/frontend-error.log" ]; then
    FRONTEND_ERRORS=$(tail -100 ./logs/frontend-error.log 2>/dev/null | grep "$(date '+%Y-%m-%d')" | wc -l)
    if [ "$FRONTEND_ERRORS" -lt 5 ]; then
        log_pass "Frontend errors hoje: $FRONTEND_ERRORS"
    else
        log_warn "Muitos erros Frontend hoje: $FRONTEND_ERRORS"
        ERROR_COUNT=$((ERROR_COUNT + FRONTEND_ERRORS))
    fi
fi

if [ -f "./logs/backend-error.log" ]; then
    BACKEND_ERRORS=$(tail -100 ./logs/backend-error.log 2>/dev/null | grep "$(date '+%Y-%m-%d')" | wc -l)
    if [ "$BACKEND_ERRORS" -lt 5 ]; then
        log_pass "Backend errors hoje: $BACKEND_ERRORS"
    else
        log_warn "Muitos erros Backend hoje: $BACKEND_ERRORS"
        ERROR_COUNT=$((ERROR_COUNT + BACKEND_ERRORS))
    fi
fi
echo ""

# 10. Verificar conectividade externa
log_check "Verificando conectividade externa..."
if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    log_pass "Conectividade externa funcionando"
else
    log_fail "Sem conectividade externa"
fi

if curl -s -I https://www.google.com --connect-timeout 5 >/dev/null 2>&1; then
    log_pass "HTTPS externo funcionando"
else
    log_fail "HTTPS externo não funcionando"
fi
echo ""

# Resumo final
print_header "RESUMO DA VERIFICAÇÃO DE SAÚDE"
echo ""

HEALTH_SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo -e "${CYAN}📊 Estatísticas:${NC}"
echo -e "   Total de verificações: $TOTAL_CHECKS"
echo -e "   Passou: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "   Falhou: ${RED}$FAILED_CHECKS${NC}"
echo -e "   Score de saúde: ${HEALTH_SCORE}%"
echo ""

if [ $HEALTH_SCORE -ge 90 ]; then
    echo -e "${GREEN}🎉 SISTEMA SAUDÁVEL${NC}"
    echo -e "${GREEN}✨ Portal Sabercon está funcionando perfeitamente!${NC}"
    EXIT_CODE=0
elif [ $HEALTH_SCORE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  SISTEMA COM AVISOS${NC}"
    echo -e "${YELLOW}🔧 Algumas verificações falharam, mas o sistema está funcional${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}🚨 SISTEMA COM PROBLEMAS${NC}"
    echo -e "${RED}❌ Múltiplas verificações falharam, ação necessária${NC}"
    EXIT_CODE=2
fi

echo ""
echo -e "${CYAN}📋 Próximos passos recomendados:${NC}"
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "   • Verificar logs: pm2 logs"
    echo -e "   • Verificar status: pm2 list"
    echo -e "   • Verificar Nginx: sudo systemctl status nginx"
    echo -e "   • Verificar recursos: htop"
fi
echo -e "   • Monitoramento completo: /root/monitor-portal.sh"
echo -e "   • Logs detalhados: tail -f /var/log/nginx/error.log"
echo ""

print_header "VERIFICAÇÃO CONCLUÍDA"

exit $EXIT_CODE 