import { AppDataSource } from '../config/typeorm.config';
import { Settings } from '../entities/Settings';
import { Repository } from 'typeorm';

export interface SettingsUpdate {
  [key: string]: any;
}

class SystemSettingsService {
  private settingsRepository: Repository<Settings>;

  constructor() {
    this.settingsRepository = AppDataSource.getRepository(Settings);
  }

  private parseValue(setting: Settings): any {
    if (setting.value === null || setting.value === undefined) {
        return null;
    }
    
    let valueToParse = setting.value;

    // Como settingsType não existe mais, tentamos inferir o tipo
    if (valueToParse === 'true' || valueToParse === 'false') {
      return valueToParse === 'true';
    }
    if (!isNaN(parseFloat(valueToParse)) && isFinite(Number(valueToParse))) {
      return Number(valueToParse);
    }
    try {
      const json = JSON.parse(valueToParse);
      return json;
    } catch (e) {
      // Não é JSON, retorna como string
    }
    return valueToParse;
  }

  private stringifyValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  async getAllSettings(includePrivate: boolean = false): Promise<Record<string, any>> {
    const queryBuilder = this.settingsRepository.createQueryBuilder('setting');

    if (!includePrivate) {
      // Assumindo que não há uma coluna is_public, então não filtramos
    }

    const settings = await queryBuilder.orderBy('setting.settingsKey', 'ASC').getMany();
    
    const result: Record<string, any> = {};
    settings.forEach(setting => {
        result[setting.settingsKey] = this.parseValue(setting);
    });

    return result;
  }

  async getSettingsByCategory(category: string, includePrivate: boolean = false): Promise<Record<string, any>> {
     // A entidade 'Settings' não possui uma coluna 'category', então este método não pode ser implementado como antes.
     // Retornando todas as configurações por enquanto.
     console.warn("A entidade 'Settings' não possui uma coluna 'category'. Retornando todas as configurações.");
     return this.getAllSettings(includePrivate);
  }

  async getSetting(key: string): Promise<any> {
    const setting = await this.settingsRepository.findOne({ where: { settingsKey: key } });
    if (!setting) {
      return null;
    }
    return this.parseValue(setting);
  }

  async updateSettings(updates: SettingsUpdate): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        for (const [key, value] of Object.entries(updates)) {
            const existingSetting = await queryRunner.manager.findOne(Settings, { where: { settingsKey: key } });

            if (existingSetting) {
                let finalValue = this.stringifyValue(value);
                await queryRunner.manager.update(Settings, { id: existingSetting.id }, { value: finalValue });
            } else {
                // Se a configuração não existe, talvez você queira criá-la
                // Por enquanto, vamos apenas logar um aviso
                console.warn(`Configuração com a chave '${key}' não encontrada. Ignorando atualização.`);
            }
        }
        await queryRunner.commitTransaction();
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Erro ao atualizar configurações:', error);
        throw new Error('Erro ao atualizar configurações do sistema');
    } finally {
        await queryRunner.release();
    }
  }
}

export default new SystemSettingsService();