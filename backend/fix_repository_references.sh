#!/bin/bash

# Script para corrigir repositórios que usam this.repository incorretamente
echo "Corrigindo repositórios que usam this.repository incorretamente..."

cd /var/www/portal/backend/src/repositories

for file in *.ts; do
  if grep -q "this.repository" "$file" && grep -q "extends ExtendedRepository" "$file"; then
    echo "Corrigindo $file..."
    
    # Extrair o nome da entidade
    entityName=$(echo "$file" | sed 's/Repository.ts$//')
    
    # Criar arquivo temporário
    cat "$file" > "${file}.tmp"
    
    # Substituir o bloco if (this.repository) { ... } else { ... } por um bloco que usa this.db
    awk '
    BEGIN { 
      print_mode = 1; 
      found_if_repository = 0;
      found_else = 0;
      brace_count = 0;
    }
    
    /if[[:space:]]*\([[:space:]]*this\.repository[[:space:]]*\)[[:space:]]*\{/ { 
      found_if_repository = 1;
      brace_count = 1;
      
      # Imprimir código de substituição
      print "      // Usar diretamente o db e tableName herdados da classe base";
      print "      let query = this.db(this.tableName).select(\"*\");";
      print "";
      print "      // Adicione condições de pesquisa específicas para esta entidade";
      print "      if (search) {";
      print "        query = query.whereILike(\"name\", `%${search}%`);";
      print "      }";
      print "";
      print "      // Executar a consulta paginada";
      print "      const offset = (page - 1) * limit;";
      print "      const data = await query";
      print "        .orderBy(\"id\", \"DESC\")";
      print "        .limit(limit)";
      print "        .offset(offset);";
      print "";
      print "      // Contar o total de registros";
      print "      const countResult = await this.db(this.tableName)";
      print "        .count(\"* as total\")";
      print "        .modify(qb => {";
      print "          if (search) {";
      print "            qb.whereILike(\"name\", `%${search}%`);";
      print "          }";
      print "        })";
      print "        .first();";
      print "";
      print "      const total = parseInt(countResult?.total as string, 10) || 0;";
      print "";
      print "      return {";
      print "        data,";
      print "        total,";
      print "        page,";
      print "        limit";
      print "      };";
      
      print_mode = 0;
      next;
    }
    
    # Contar chaves para saber quando termina o bloco if
    /\{/ { if (!print_mode) brace_count++; }
    /\}/ { 
      if (!print_mode) {
        brace_count--; 
        if (brace_count == 0 && !found_else) {
          print_mode = 1;
        }
      }
    }
    
    # Detectar o bloco else
    /else[[:space:]]*\{/ {
      if (!print_mode) {
        found_else = 1;
        brace_count++;
      }
    }
    
    # Imprimir apenas quando estiver no modo de impressão
    { if (print_mode) print $0; }
    
    # Quando encontrar o fim do bloco else, voltar a imprimir
    /\}/ {
      if (!print_mode && found_else && brace_count == 0) {
        print_mode = 1;
        found_if_repository = 0;
        found_else = 0;
      }
    }
    ' "${file}.tmp" > "$file"
    
    # Remover arquivo temporário
    rm "${file}.tmp"
  fi
done

echo "Correção de referências a this.repository concluída!" 