import { BaseRepository } from './BaseRepository';

// Interface para desacoplar
export interface Certificate {
    id: string;
    user_id: string;
    tv_show_id: string;
    tv_show_name: string;
    document: string;
    license_code: string;
    score: number;
    recreate: boolean;
    date_created: Date;
    last_updated: Date;
    path?: string;
}

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