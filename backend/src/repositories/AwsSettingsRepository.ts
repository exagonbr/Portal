import { AppDataSource } from "../config/typeorm.config";
import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { AwsSettings } from '../types/aws'; // Supondo que os tipos AWS estejam definidos
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('awssettingss')
class AwsSettingsEntity implements AwsSettings {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  access_key_id!: string;

  @Column()
  secret_access_key!: string;

  @Column()
  region!: string;

  @Column({ nullable: true })
  s3_bucket_name?: string;

  @Column()
  cloudwatch_namespace!: string;

  @Column()
  update_interval!: number;

  @Column()
  enable_real_time_updates!: boolean;

  @Column()
  is_active!: boolean;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}

export interface CreateAwsSettingsDto extends Omit<AwsSettings, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {}
export interface UpdateAwsSettingsDto extends Partial<CreateAwsSettingsDto> {}

export class AwsSettingsRepository extends ExtendedRepository<AwsSettings> {
  private repository: Repository<AwsSettingsEntity>;
  constructor() {
    super("awssettingss");
    this.repository = AppDataSource.getRepository(AwsSettingsEntity);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<AwsSettings>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select("*");

      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike("name", `%${search}%`);
      }

      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("id", "DESC")
        .limit(limit)
        .offset(offset);

      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify(qb => {
          if (search) {
            qb.whereILike("name", `%${search}%`);
          }
        })
        .first();

      const total = parseInt(countResult?.total as string, 10) || 0;

      return {
        data,
        total,
        page,
        limit
      };
    } catch (error) {
      throw error;
    }
  }

  async findActive(): Promise<AwsSettings | null> {
    return this.findOne({ is_active: true } as Partial<AwsSettings>);
  }

  async createSettings(data: CreateAwsSettingsDto, userId: string): Promise<AwsSettings> {
    // Desativa outras configurações ativas
    await this.db(this.tableName).where({ is_active: true }).update({ is_active: false });
    
    const settingsData = {
        ...data,
        is_active: true,
        created_by: userId,
        updated_by: userId,
    };
    return this.create(settingsData);
  }

  async updateSettings(id: number, data: UpdateAwsSettingsDto, userId: string): Promise<AwsSettings | null> {
    const updateData = {
        ...data,
        updated_by: userId,
    };
    return this.update(id, updateData);
  }

  async setActive(id: number, userId: string): Promise<AwsSettings | null> {
    await this.db(this.tableName).where({ is_active: true }).update({ is_active: false, updated_by: userId });
    return this.update(id, { is_active: true, updated_by: userId } as Partial<AwsSettings>);
  }
}
