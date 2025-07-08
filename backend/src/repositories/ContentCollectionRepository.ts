import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Collection } from '../entities/Collection';
import { Module } from '../entities/Module';

export interface CreateCollectionData extends Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'modules'> {}
export interface UpdateCollectionData extends Partial<CreateCollectionData> {}

export class ContentCollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super('collections');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<ContentCollection>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('contentcollection');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('contentcollection.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('contentcollection.id', 'DESC')
          .getManyAndCount();
          
        return {
          data,
          total,
          page,
          limit
        };
      } else {
        // Fallback para query raw
        const query = `
          SELECT * FROM contentcollection
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM contentcollection
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
        `;

        const [data, countResult] = await Promise.all([
          AppDataSource.query(query),
          AppDataSource.query(countQuery)
        ]);

        const total = parseInt(countResult[0].total);

        return {
          data,
          total,
          page,
          limit
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar registros de contentcollection:`, error);
      throw error;
    }
  }

  async createCollection(data: CreateCollectionData): Promise<Collection> {
    return this.create(data);
  }

  async updateCollection(id: string, data: UpdateCollectionData): Promise<Collection | null> {
    return this.update(id, data);
  }

  async deleteCollection(id: string): Promise<boolean> {
    // Deletar módulos associados primeiro
    await this.db('modules').where('collection_id', id).del();
    return this.delete(id);
  }

  async findByCreator(creatorId: string): Promise<Collection[]> {
    return this.findAll({ created_by: parseInt(creatorId) } as Partial<Collection>);
  }

  async findBySubject(subject: string): Promise<Collection[]> {
    return this.findAll({ subject } as Partial<Collection>);
  }

  async findByTag(tag: string): Promise<Collection[]> {
    return this.db(this.tableName).whereRaw('tags @> ?', `"${tag}"`);
  }

  async search(term: string): Promise<Collection[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${term}%`)
      .orWhere('synopsis', 'ilike', `%${term}%`)
      .orWhere('subject', 'ilike', `%${term}%`);
  }

  async getModules(collectionId: string): Promise<Module[]> {
    return this.db('modules').where('collection_id', collectionId).orderBy('order', 'asc');
  }
}