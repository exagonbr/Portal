#!/bin/bash

# Corrige todos os controllers que seguem o padrão de propriedade duplicada e uso sem this.

for file in *.ts; do
  # Corrige apenas arquivos que contenham 'private' seguido de 'Repository' ou 'repository'
  if grep -qE "private [A-Za-z]+Repository" "$file"; then
    echo "Corrigindo $file ..."

    # Remove propriedades duplicadas (duas linhas private ...Repository)
    sed -i '/private [A-Za-z]\+Repository: [A-Za-z]\+Repository;/N;/\n *private [a-z]\+Repository: [A-Za-z]\+Repository;/d' "$file"

    # Garante que a propriedade seja camelCase e inicializada no construtor
    sed -i -E 's/private [A-Za-z]+Repository: ([A-Za-z]+Repository);/private \L\1: \1;/' "$file"
    sed -i -E 's/this\.[A-Za-z]+Repository = repository;/this.repository = repository;/' "$file"
    sed -i -E 's/const repository = new ([A-Za-z]+Repository)\(\);/const repository = new \1();/' "$file"

    # Corrige todas as referências para usar this.repository
    repoName=$(grep -oE "private ([a-z]+Repository)" "$file" | head -1 | awk '{print $2}')
    if [ ! -z "$repoName" ]; then
      sed -i "s/[^a-zA-Z0-9_]$repoName/ this.$repoName/g" "$file"
      sed -i "s/^$repoName/this.$repoName/g" "$file"
      sed -i "s/await $repoName/await this.$repoName/g" "$file"
    fi

    # Remove espaços duplicados gerados
    sed -i 's/  / /g' "$file"
  fi
done

echo "Correção automática concluída!" 