import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('security_policies')
export class SecurityPolicies {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  passwordMinLength?: string;

  @Column({ nullable: true })
  passwordRequireUppercase?: string;

  @Column({ nullable: true })
  passwordRequireLowercase?: string;

  @Column({ nullable: true })
  passwordRequireNumbers?: string;

  @Column({ nullable: true })
  passwordRequireSpecialChars?: string;

  @Column({ nullable: true })
  passwordExpiryDays?: string;

  @Column({ nullable: true })
  passwordPreventReuse?: string;

  @Column({ nullable: true })
  accountMaxLoginAttempts?: string;

  @Column({ nullable: true })
  accountLockoutDurationMinutes?: string;

  @Column({ nullable: true })
  accountSessionTimeoutMinutes?: string;

  @Column({ nullable: true })
  accountRequireMfa?: string;

  @Column({ nullable: true })
  accountInactivityLockoutDays?: string;

  @Column({ nullable: true })
  dataRetentionMonths?: string;

  @Column({ nullable: true })
  dataEncryptSensitiveData?: string;

  @Column({ nullable: true })
  dataAnonymizeDeletedUsers?: string;

  @Column({ nullable: true })
  dataEnableAuditLogging?: string;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}