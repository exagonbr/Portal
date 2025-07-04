import { AppDataSource } from '../config/typeorm.config';
import { Institution } from '../entities/Institution';
import { Repository } from 'typeorm';

export interface InstitutionDto {
  id: number;
  name: string;
  companyName: string;
  document: string;
}

export interface InstitutionFilterDto {
    page?: number;
    limit?: number;
    search?: string;
}

export class InstitutionService {
  private institutionRepository: Repository<Institution>;

  constructor() {
    this.institutionRepository = AppDataSource.getRepository(Institution);
  }

  async findInstitutionsWithFilters(filters: InstitutionFilterDto): Promise<{ institutions: InstitutionDto[], total: number }> {
    const { page = 1, limit = 10, search } = filters;
    const queryBuilder = this.institutionRepository.createQueryBuilder('institution')
        .where('institution.deleted IS NOT TRUE');

    if (search) {
      queryBuilder.andWhere('(institution.name LIKE :search OR institution.companyName LIKE :search OR institution.document LIKE :search)', { search: `%${search}%` });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('institution.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const institutions = await queryBuilder.getMany();

    const mappedInstitutions = institutions.map(inst => ({
        id: inst.id,
        name: inst.name,
        companyName: inst.companyName,
        document: inst.document,
    }));

    return { institutions: mappedInstitutions, total };
  }

  async findInstitutionById(id: number): Promise<Institution | null> {
    return this.institutionRepository.findOneBy({ id });
  }

  async createInstitution(data: Partial<Institution>): Promise<Institution> {
    const institution = this.institutionRepository.create(data);
    return this.institutionRepository.save(institution);
  }

  async updateInstitution(id: number, data: Partial<Institution>): Promise<Institution | null> {
    const institution = await this.institutionRepository.findOneBy({ id });
    if (!institution) {
      return null;
    }
    this.institutionRepository.merge(institution, data);
    return this.institutionRepository.save(institution);
  }

  async deleteInstitution(id: number): Promise<boolean> {
    const result = await this.institutionRepository.update(id, { deleted: true });
    return result.affected ? result.affected > 0 : false;
  }
}

export default new InstitutionService();