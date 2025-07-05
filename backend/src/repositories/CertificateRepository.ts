import { BaseRepository } from './BaseRepository';
import { Certificate } from '../entities/Certificate';

export class CertificateRepository extends BaseRepository<Certificate> {
  constructor() {
    super('certificates');
  }

  /**
   * Busca certificados com condições customizadas
   */
  async findByCondition(whereClause: string, params: any[]): Promise<Certificate[]> {
    return this.db(this.tableName)
      .whereRaw(whereClause, params)
      .select('*');
  }
}