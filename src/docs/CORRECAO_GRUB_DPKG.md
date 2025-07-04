# 🔧 Correção de Erro GRUB/dpkg

## ❌ Problema
```
Unknown device "/dev/disk/by-id/*": No such file or directory
dpkg: error processing package grub-efi-amd64-signed (--configure)
```

## ✅ Solução Rápida

### Opção 1: Script Automático
```bash
# Executar script de correção específico
sudo bash fix-grub-dpkg-error.sh

# Depois executar o deploy
sudo bash deploy-portal-production.sh
```

### Opção 2: Comandos Manuais
```bash
# 1. Parar processos travados
sudo killall apt apt-get dpkg 2>/dev/null || true

# 2. Remover locks
sudo rm -f /var/lib/dpkg/lock-frontend
sudo rm -f /var/lib/apt/lists/lock
sudo rm -f /var/cache/apt/archives/lock
sudo rm -f /var/lib/dpkg/lock

# 3. Configurar pacotes pendentes
sudo dpkg --configure -a

# 4. Se erro persistir, remover pacotes GRUB (seguro em VPS)
sudo apt-get remove --purge grub-efi-amd64-signed shim-signed -y
sudo apt-get remove --purge grub-efi-amd64 grub-efi-amd64-bin -y

# 5. Corrigir dependências
sudo apt-get install -f

# 6. Atualizar sistema
sudo apt update

# 7. Executar deploy
sudo bash deploy-portal-production.sh
```

## 🔍 Por que acontece?

Este erro é comum em servidores VPS onde:
- Pacotes GRUB são instalados mas não conseguem acessar hardware de boot
- Sistema tenta configurar UEFI em ambiente virtualizado
- Locks do APT ficam travados durante instalações

## ⚠️ É seguro remover o GRUB?

**SIM** em servidores VPS porque:
- VPS usa boot virtualizado pelo provedor
- GRUB não é necessário para funcionamento
- Provedor gerencia o processo de boot
- Remoção não afeta funcionamento do sistema

## 🚀 Deploy Atualizado

O script `deploy-portal-production.sh` foi atualizado para:
- ✅ Detectar automaticamente problemas de sistema
- ✅ Corrigir locks do APT
- ✅ Remover pacotes GRUB problemáticos
- ✅ Limpar cache e dependências
- ✅ Continuar deploy normalmente

## 📞 Suporte

Se o problema persistir:
1. Execute: `sudo bash fix-grub-dpkg-error.sh`
2. Verifique logs: `sudo journalctl -u apt`
3. Teste manual: `sudo apt update && sudo apt list --installed`

---

**Desenvolvido para Portal Sabercon** 🎓 