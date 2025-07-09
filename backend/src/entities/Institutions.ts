import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('institution')
export class Institution {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  version?: string;

  @Column({ nullable: true })
  accountableContact?: string;

  @Column({ nullable: true })
  accountableName?: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  complement?: string;

  @Column({ nullable: true })
  contractDisabled?: string;

  @Column({ nullable: true })
  contractInvoiceNum?: string;

  @Column({ nullable: true })
  contractNum?: string;

  @Column({ nullable: true })
  contractTermEnd?: string;

  @Column({ nullable: true })
  contractTermStart?: string;

  @Column({ nullable: true })
  dateCreated?: string;

  @Column({ nullable: true })
  deleted?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ nullable: true })
  document?: string;

  @Column({ nullable: true })
  invoiceDate?: string;

  @Column({ nullable: true })
  lastUpdated?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  score?: string;

  @Column({ nullable: true })
  hasLibraryPlatform?: string;

  @Column({ nullable: true })
  hasPrincipalPlatform?: string;

  @Column({ nullable: true })
  hasStudentPlatform?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  status?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}