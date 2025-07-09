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

  async findById(id: string | number): Promise<T | null> {
    return super.findById(id);
  }

  async create(data: Partial<T>): Promise<T> {
    return super.create(data);
  }

  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    return super.update(id, data);
  }

  async delete(id: string | number): Promise<boolean> {
    return super.delete(id);
  }
} 