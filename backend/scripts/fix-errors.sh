#!/bin/bash

# Script para corrigir erros no projeto

echo "Iniciando correção de erros..."

# Criar ExtendedRepository.ts se não existir
if [ ! -f "src/repositories/ExtendedRepository.ts" ]; then
  echo "Criando ExtendedRepository.ts..."
  cat > src/repositories/ExtendedRepository.ts << 'EOL'
import { BaseRepository } from './BaseRepository';

// Interface para os métodos estendidos
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Classe abstrata para repositórios com funcionalidades estendidas
export abstract class ExtendedRepository<T extends { id: string | number }> extends BaseRepository<T> {
  constructor(tableName: string) {
    super(tableName);
  }

  // Método para busca paginada com opção de pesquisa
  abstract findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResult<T>>;

  // Implementação padrão do findAll para manter compatibilidade com a classe base
  async findAll(filters?: Partial<T>, pagination?: { page: number; limit: number }): Promise<T[]> {
    return super.findAll(filters, pagination);
  }
}
EOL
  echo "ExtendedRepository.ts criado com sucesso."
fi

# Executar os scripts de correção
echo "Corrigindo repositórios..."
node scripts/fix-repository-errors.js

echo "Corrigindo controllers..."
node scripts/fix-controller-errors.js

echo "Verificando erros de compilação..."
npx tsc --noEmit

echo "Processo concluído." 