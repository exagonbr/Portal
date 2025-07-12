import { ExtendedRepository, PaginatedResult } from "./ExtendedRepository";
import { ChatMessage } from '../entities/ChatMessage';

export class ChatRepository extends ExtendedRepository<ChatMessage> {
  constructor() {
    super('chat_messages');
  }
  
  // Implementação do método findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<ChatMessage>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select('*');
      
      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.where('content', 'ilike', `%${search}%`);
      }
      
      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .offset(offset);
      
      // Contar o total de registros
      let countQuery = this.db(this.tableName).count('* as total');
      
      if (search) {
        countQuery = countQuery.where('content', 'ilike', `%${search}%`);
      }
      
      const countResult = await countQuery.first();
      const total = parseInt(String(countResult?.total || '0'), 10);
      
      return {
        data: data as ChatMessage[],
        total,
        page,
        limit
      };
    } catch (error) {
      console.error(`Erro ao buscar registros de chat:`, error);
      throw error;
    }
  }
}