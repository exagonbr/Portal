import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';
import { User } from './User';

@Entity('institution')
export class Institution {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'accountable_contact', type: 'varchar', length: 255 })
  accountableContact!: string;

  @Column({ name: 'accountable_name', type: 'varchar', length: 255 })
  accountableName!: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complement?: string;

  @Column({ name: 'contract_disabled', type: 'boolean', default: false })
  contractDisabled!: boolean;

  @Column({ name: 'contract_invoice_num', type: 'varchar', length: 255, nullable: true })
  contractInvoiceNum?: string;

  @Column({ name: 'contract_num', type: 'bigint', nullable: true })
  contractNum?: number;

  @Column({ name: 'contract_term_end', type: 'timestamp' })
  contractTermEnd!: Date;

  @Column({ name: 'contract_term_start', type: 'timestamp' })
  contractTermStart!: Date;

  @Column({ name: 'date_created', type: 'timestamp', nullable: true })
  dateCreated?: Date;

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  @Column({ type: 'varchar', length: 255 })
  district!: string;

  @Column({ type: 'varchar', length: 255 })
  document!: string;

  @Column({ name: 'invoice_date', type: 'timestamp', nullable: true })
  invoiceDate?: Date;

  @Column({ name: 'last_updated', type: 'timestamp', nullable: true })
  lastUpdated?: Date;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 255 })
  postalCode!: string;

  @Column({ type: 'varchar', length: 255 })
  state!: string;

  @Column({ type: 'varchar', length: 255 })
  street!: string;

  @Column({ type: 'bigint', nullable: true })
  score?: number;

  @Column({ name: 'has_library_platform', type: 'boolean', default: false })
  hasLibraryPlatform!: boolean;

  @Column({ name: 'has_principal_platform', type: 'boolean', default: false })
  hasPrincipalPlatform!: boolean;

  @Column({ name: 'has_student_platform', type: 'boolean', default: false })
  hasStudentPlatform!: boolean;

  // Relacionamentos
  @OneToMany(() => User, user => user.institution)
  users!: User[];
}