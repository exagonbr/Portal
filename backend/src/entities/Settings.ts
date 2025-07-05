import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'default_value', type: 'varchar', length: 255, nullable: true })
  defaultValue?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'boolean', nullable: true })
  required?: boolean;

  @Column({ name: 'settings_key', type: 'varchar', length: 255 })
  settingsKey!: string;

  @Column({ name: 'settings_type', type: 'varchar', length: 255, nullable: true })
  settingsType?: string;

  @Column({ name: 'validation_required', type: 'boolean', nullable: true })
  validationRequired?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  value?: string;
}