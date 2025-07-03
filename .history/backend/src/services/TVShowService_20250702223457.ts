import * as mysql from 'mysql2/promise';

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'sabercon',
  password: process.env.MYSQL_PASSWORD || 'gWg28m8^vffI9X#',
  database: process.env.MYSQL_DATABASE || 'sabercon'
};

export interface TVShowCollection {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date: Date;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  producer?: string;
  total_load?: string;
  manual_support_path?: string;
  contract_term_end: Date;
  created_at: Date;
  updated_at: Date;
}

export class TVShowService {
  private static async getConnection() {
    return await mysql.createConnection(mysqlConfig);
  }

  /**
   * Busca todas as coleções (TV Shows) não deletadas
   */
  static async getAllCollections(): Promise<TVShowCollection[]> {
    const connection = await this.getConnection();
    
    try {
      const [rows] = await connection.execute(`
        SELECT 
          id,
          name,
          overview,
          poster_path,
          backdrop_path,
          first_air_date,
          popularity,
          vote_average,
          vote_count,
          producer,
          total_load,
          manual_support_path,
          contract_term_end,
          date_created as created_at,
          last_updated as updated_at
        FROM tv_show 
        WHERE deleted IS NULL OR deleted = 0
        ORDER BY popularity DESC, vote_average DESC, name ASC
      `);
      
      return rows as TVShowCollection[];
    } catch (error) {
      console.log('Erro ao buscar coleções:', error);
      throw new Error('Falha ao buscar coleções do banco de dados');
    } finally {
      await connection.end();
    }
  }

  /**
   * Busca uma coleção específica por ID
   */
  static async getCollectionById(id: number): Promise<TVShowCollection | null> {
    const connection = await this.getConnection();
    
    try {
      const [rows] = await connection.execute(`
        SELECT 
          id,
          name,
          overview,
          poster_path,
          backdrop_path,
          first_air_date,
          popularity,
          vote_average,
          vote_count,
          producer,
          total_load,
          manual_support_path,
          contract_term_end,
          date_created as created_at,
          last_updated as updated_at
        FROM tv_show 
        WHERE id = ? AND (deleted IS NULL OR deleted = 0)
      `, [id]);
      
      const collections = rows as TVShowCollection[];
      return collections.length > 0 ? collections[0] : null;
    } catch (error) {
      console.log('Erro ao buscar coleção:', error);
      throw new Error('Falha ao buscar coleção do banco de dados');
    } finally {
      await connection.end();
    }
  }

  /**
   * Busca coleções por termo de pesquisa
   */
  static async searchCollections(searchTerm: string): Promise<TVShowCollection[]> {
    const connection = await this.getConnection();
    
    try {
      const [rows] = await connection.execute(`
        SELECT 
          id,
          name,
          overview,
          poster_path,
          backdrop_path,
          first_air_date,
          popularity,
          vote_average,
          vote_count,
          producer,
          total_load,
          manual_support_path,
          contract_term_end,
          date_created as created_at,
          last_updated as updated_at
        FROM tv_show 
        WHERE (deleted IS NULL OR deleted = 0)
          AND (name LIKE ? OR overview LIKE ? OR producer LIKE ?)
        ORDER BY popularity DESC, vote_average DESC, name ASC
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
      
      return rows as TVShowCollection[];
    } catch (error) {
      console.log('Erro ao pesquisar coleções:', error);
      throw new Error('Falha ao pesquisar coleções no banco de dados');
    } finally {
      await connection.end();
    }
  }

  /**
   * Busca coleções populares (com maior popularidade)
   */
  static async getPopularCollections(limit: number = 10): Promise<TVShowCollection[]> {
    const connection = await this.getConnection();
    
    try {
      const [rows] = await connection.execute(`
        SELECT 
          id,
          name,
          overview,
          poster_path,
          backdrop_path,
          first_air_date,
          popularity,
          vote_average,
          vote_count,
          producer,
          total_load,
          manual_support_path,
          contract_term_end,
          date_created as created_at,
          last_updated as updated_at
        FROM tv_show 
        WHERE (deleted IS NULL OR deleted = 0)
          AND popularity IS NOT NULL
        ORDER BY popularity DESC, vote_average DESC
        LIMIT ?
      `, [limit]);
      
      return rows as TVShowCollection[];
    } catch (error) {
      console.log('Erro ao buscar coleções populares:', error);
      throw new Error('Falha ao buscar coleções populares do banco de dados');
    } finally {
      await connection.end();
    }
  }

  /**
   * Busca coleções mais bem avaliadas
   */
  static async getTopRatedCollections(limit: number = 10): Promise<TVShowCollection[]> {
    const connection = await this.getConnection();
    
    try {
      // Garantir que limit seja um número válido
      const validLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
      
      const [rows] = await connection.execute(`
        SELECT
          id,
          name,
          overview,
          poster_path,
          backdrop_path,
          first_air_date,
          popularity,
          vote_average,
          vote_count,
          producer,
          total_load,
          manual_support_path,
          contract_term_end,
          date_created as created_at,
          last_updated as updated_at
        FROM tv_show
        WHERE (deleted IS NULL OR deleted = 0)
          AND vote_average IS NOT NULL
          AND vote_count > 0
        ORDER BY vote_average DESC, vote_count DESC
        LIMIT ?
      `, [validLimit]);
      
      return rows as TVShowCollection[];
    } catch (error) {
      console.log('Erro ao buscar coleções mais bem avaliadas:', error);
      throw new Error('Falha ao buscar coleções mais bem avaliadas do banco de dados');
    } finally {
      await connection.end();
    }
  }

  /**
   * Busca coleções recentes
   */
  static async getRecentCollections(limit: number = 10): Promise<TVShowCollection[]> {
    const connection = await this.getConnection();
    
    try {
      const [rows] = await connection.execute(`
        SELECT 
          id,
          name,
          overview,
          poster_path,
          backdrop_path,
          first_air_date,
          popularity,
          vote_average,
          vote_count,
          producer,
          total_load,
          manual_support_path,
          contract_term_end,
          date_created as created_at,
          last_updated as updated_at
        FROM tv_show 
        WHERE (deleted IS NULL OR deleted = 0)
        ORDER BY date_created DESC, last_updated DESC
        LIMIT ?
      `, [limit]);
      
      return rows as TVShowCollection[];
    } catch (error) {
      console.log('Erro ao buscar coleções recentes:', error);
      throw new Error('Falha ao buscar coleções recentes do banco de dados');
    } finally {
      await connection.end();
    }
  }
} 