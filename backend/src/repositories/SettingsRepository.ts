import { BaseRepository } from './BaseRepository';
import { Settings } from '../entities/Settings';

export class SettingsRepository extends BaseRepository<Settings> {
  constructor() {
    super('settings');
  }

  async findByKey(key: string): Promise<Settings | null> {
    return this.findOne({ settingsKey: key } as Partial<Settings>);
  }

  async getValue(key: string, defaultValue: any = null): Promise<any> {
    const setting = await this.findByKey(key);
    if (setting && setting.value) {
        try {
            // Tenta fazer o parse do JSON, se falhar, retorna o valor como string
            return JSON.parse(setting.value);
        } catch (e) {
            return setting.value;
        }
    }
    return defaultValue;
  }

  async setValue(key: string, value: any): Promise<Settings> {
    const existing = await this.findByKey(key);
    const valueString = typeof value === 'string' ? value : JSON.stringify(value);

    if (existing) {
      return this.update(existing.id, { value: valueString } as Partial<Settings>).then(res => res!);
    } else {
      return this.create({ settingsKey: key, value: valueString } as Partial<Settings>);
    }
  }
}