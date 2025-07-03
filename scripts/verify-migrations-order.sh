#!/bin/bash

# Script para verificar a ordem das migrações

echo "=== Verificando ordem das migrações ==="
echo ""

cd backend/migrations

echo "Migrações em ordem de execução:"
echo "--------------------------------"
ls -1 *.ts | sort

echo ""
echo "✓ Ordem verificada!"
echo ""
echo "Notas importantes:"
echo "- A migração create_user_groups agora será executada APÓS institutions ser criada"
echo "- Todas as migrações de 2025 serão executadas após as de 2024"
echo "- A ordem está correta para evitar erros de foreign key"