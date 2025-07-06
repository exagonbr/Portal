#!/bin/bash

# Script para corrigir conflito de rotas dinâmicas no Next.js

echo "🔧 Corrigindo conflito de rotas dinâmicas..."
echo "=========================================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Diretório base
BASE_DIR="src/app/api/books"

echo -e "\n${BLUE}1. Analisando estrutura atual...${NC}"
echo "Estrutura encontrada:"
echo "├── $BASE_DIR/"
echo "│   ├── [bookId]/"
echo "│   │   ├── favorite/"
echo "│   │   ├── highlights/"
echo "│   │   └── progress/"
echo "│   └── [id]/"
echo "│       └── route.ts"

echo -e "\n${YELLOW}⚠️  Problema: Dois parâmetros dinâmicos diferentes no mesmo path${NC}"
echo "Next.js não permite usar [bookId] e [id] no mesmo nível"

# Fazer backup
echo -e "\n${BLUE}2. Fazendo backup...${NC}"
cp -r "$BASE_DIR" "${BASE_DIR}.backup.$(date +%Y%m%d-%H%M%S)"
echo -e "${GREEN}✅ Backup criado${NC}"

# Mover conteúdo de [bookId] para [id]
echo -e "\n${BLUE}3. Consolidando rotas em [id]...${NC}"

# Mover subdiretórios
for dir in favorite highlights progress; do
    if [ -d "$BASE_DIR/[bookId]/$dir" ]; then
        echo "Movendo $dir..."
        mv "$BASE_DIR/[bookId]/$dir" "$BASE_DIR/[id]/"
        echo -e "${GREEN}✅ $dir movido${NC}"
    fi
done

# Remover diretório [bookId] vazio
if [ -d "$BASE_DIR/[bookId]" ]; then
    rmdir "$BASE_DIR/[bookId]"
    echo -e "${GREEN}✅ Diretório [bookId] removido${NC}"
fi

# Atualizar referências nos arquivos
echo -e "\n${BLUE}4. Atualizando referências nos arquivos...${NC}"

# Atualizar imports e referências a bookId para id
for file in $(find "$BASE_DIR/[id]" -name "*.ts" -o -name "*.tsx"); do
    if grep -q "bookId" "$file"; then
        echo "Atualizando: $file"
        # Substituir params.bookId por params.id
        sed -i 's/params\.bookId/params.id/g' "$file"
        # Substituir { bookId } por { id }
        sed -i 's/{ bookId }/{ id }/g' "$file"
        # Substituir bookId: por id:
        sed -i 's/bookId:/id:/g' "$file"
    fi
done

echo -e "${GREEN}✅ Referências atualizadas${NC}"

# Verificar estrutura final
echo -e "\n${BLUE}5. Estrutura final:${NC}"
echo "├── $BASE_DIR/"
echo "│   └── [id]/"
echo "│       ├── route.ts"
echo "│       ├── favorite/"
echo "│       ├── highlights/"
echo "│       └── progress/"

# Verificar se há outras inconsistências
echo -e "\n${BLUE}6. Verificando outras possíveis inconsistências...${NC}"

# Procurar por outras rotas com problemas similares
PROBLEMS=$(find src/app -type d -name "[*]" | grep -E "\[(id|.*Id)\]" | sort | uniq -d)
if [ -z "$PROBLEMS" ]; then
    echo -e "${GREEN}✅ Nenhuma outra inconsistência encontrada${NC}"
else
    echo -e "${YELLOW}⚠️  Outras possíveis inconsistências:${NC}"
    echo "$PROBLEMS"
fi

echo -e "\n${GREEN}✅ Correção concluída!${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"
echo "1. Reinicie o servidor Next.js"
echo "2. Verifique se o erro foi resolvido"
echo "3. Se houver problemas, o backup está em: ${BASE_DIR}.backup.*"

# Reiniciar o frontend
echo -e "\n${BLUE}7. Reiniciando o frontend...${NC}"
pm2 restart PortalServerFrontend || echo "⚠️  Não foi possível reiniciar automaticamente"

echo -e "\n${GREEN}✅ Script concluído!${NC}" 