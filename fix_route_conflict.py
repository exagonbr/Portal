#!/usr/bin/env python3

import os
import shutil
import re
from datetime import datetime

print("🔧 Corrigindo conflito de rotas dinâmicas...")
print("==========================================")

# Diretório base
base_dir = "src/app/api/books"
bookid_dir = os.path.join(base_dir, "[bookId]")
id_dir = os.path.join(base_dir, "[id]")

# Verificar se os diretórios existem
if not os.path.exists(bookid_dir):
    print("❌ Diretório [bookId] não encontrado")
    exit(1)

if not os.path.exists(id_dir):
    print("❌ Diretório [id] não encontrado")
    exit(1)

# Fazer backup
backup_dir = f"{base_dir}.backup.{datetime.now().strftime('%Y%m%d-%H%M%S')}"
print(f"\n1. Fazendo backup em {backup_dir}...")
shutil.copytree(base_dir, backup_dir)
print("✅ Backup criado")

# Mover subdiretórios de [bookId] para [id]
print("\n2. Movendo subdiretórios...")
subdirs = ["favorite", "highlights", "progress"]

for subdir in subdirs:
    src = os.path.join(bookid_dir, subdir)
    dst = os.path.join(id_dir, subdir)
    
    if os.path.exists(src):
        print(f"   Movendo {subdir}...")
        shutil.move(src, dst)
        print(f"   ✅ {subdir} movido")

# Remover diretório [bookId] vazio
print("\n3. Removendo diretório [bookId] vazio...")
try:
    os.rmdir(bookid_dir)
    print("✅ Diretório [bookId] removido")
except:
    print("⚠️  Não foi possível remover [bookId] (pode não estar vazio)")

# Atualizar referências nos arquivos
print("\n4. Atualizando referências nos arquivos...")
count = 0

for root, dirs, files in os.walk(id_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, file)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Verificar se há referências a bookId
            if 'bookId' in content:
                print(f"   Atualizando: {filepath}")
                
                # Substituir várias formas de bookId
                content = re.sub(r'params\.bookId', 'params.id', content)
                content = re.sub(r'\{ bookId \}', '{ id }', content)
                content = re.sub(r'bookId:', 'id:', content)
                content = re.sub(r"bookId'", "id'", content)
                content = re.sub(r'"bookId"', '"id"', content)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                count += 1

print(f"✅ {count} arquivos atualizados")

# Mostrar estrutura final
print("\n5. Estrutura final:")
print("└── src/app/api/books/")
print("    └── [id]/")
print("        ├── route.ts")
print("        ├── favorite/")
print("        ├── highlights/")
print("        └── progress/")

print("\n✅ Correção concluída!")
print("\nPróximos passos:")
print("1. Reinicie o servidor Next.js: pm2 restart PortalServerFrontend")
print("2. Se houver problemas, o backup está em:", backup_dir) 