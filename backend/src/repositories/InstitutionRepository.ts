import { BaseRepository } from './BaseRepository';
import { Institution } from '../entities/Institution';

// Definindo uma interface para os dados de criação para desacoplar da entidade TypeORM
export interface CreateInstitutionData {
  name: string;
  companyName: string;
  document: string;
  accountableName: string;
  accountableContact: string;
  postalCode: string;
  street: string;
  district: string;
  state: string;
  contractTermStart: Date;
  contractTermEnd: Date;
  complement?: string;
  contractDisabled?: boolean;
  hasLibraryPlatform?: boolean;
  hasPrincipalPlatform?: boolean;
  hasStudentPlatform?: boolean;
}

// Definindo uma interface para os dados de atualização
export type UpdateInstitutionData = Partial<CreateInstitutionData>;

// Definindo uma interface para os filtros de busca
export interface InstitutionFilters {
  search?: string;
  state?: string;
  contractDisabled?: boolean;
  hasLibraryPlatform?: boolean;
  page?: number;
  limit?: number;
  sortBy?: keyof Institution;
  sortOrder?: 'asc' | 'desc';
}

export class InstitutionRepository extends BaseRepository<Institution> {
  constructor() {
    super('institution');
  }

  async createInstitution(data: CreateInstitutionData): Promise<Institution> {
    return this.create(data);
  }

  async updateInstitution(id: number, data: UpdateInstitutionData): Promise<Institution | null> {
    return this.update(id, data);
  }

  async findByName(name: string): Promise<Institution[]> {
    return this.db(this.tableName).where('name', 'ilike', `%${name}%`);
  }

  async findByDocument(document: string): Promise<Institution | null> {
    return this.findOne({ document } as Partial<Institution>);
  }

  async findByState(state: string): Promise<Institution[]> {
    return this.findAll({ state } as Partial<Institution>);
  }

  async findWithFilters(filters: InstitutionFilters): Promise<{ data: Institution[], total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      ...otherFilters
    } = filters;

    const query = this.db(this.tableName).select('*');
    const countQuery = this.db(this.tableName).count('* as total').first();

    if (search) {
      query.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('companyName', 'ilike', `%${search}%`)
          .orWhere('document', 'ilike', `%${search}%`);
      });
      countQuery.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('companyName', 'ilike', `%${search}%`)
          .orWhere('document', 'ilike', `%${search}%`);
      });
    }

    if (Object.keys(otherFilters).length > 0) {
        query.where(otherFilters);
        countQuery.where(otherFilters);
    }
    
    query.orderBy(sortBy, sortOrder).limit(limit).offset((page - 1) * limit);

    const [data, totalResult] = await Promise.all([query, countQuery]);
    
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    return { data, total };
  }
}