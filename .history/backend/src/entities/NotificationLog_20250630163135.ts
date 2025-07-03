import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced'
}

@Entity('notification_logs')
@Index(['type'])
@Index(['recipient'])
@Index(['status'])
@Index(['userId'])
@Index(['verificationToken'])
@Index(['createdAt'])
@Index(['sentAt'])
@Index(['type', 'status'])
@Index(['recipient', 'type'])
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    comment: 'Tipo de notificação: email, sms ou push'
  })
  type: NotificationType;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Email, telefone ou device token do destinatário'
  })
  recipient: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Assunto da notificação (principalmente para emails)'
  })
  subject?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Conteúdo da mensagem enviada'
  })
  message?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Nome do template utilizado'
  })
  templateName?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Token de verificação quando aplicável'
  })
  verificationToken?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'ID do usuário relacionado'
  })
  userId?: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
    comment: 'Status do envio da notificação'
  })
  status: NotificationStatus;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'Provedor utilizado (Gmail, Twilio, Firebase, etc.)'
  })
  provider?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ID da mensagem retornado pelo provedor'
  })
  providerMessageId?: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Resposta completa do provedor'
  })
  providerResponse?: any;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Mensagem de erro em caso de falha'
  })
  errorMessage?: string;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Número de tentativas de reenvio'
  })
  retryCount: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Data/hora agendada para envio'
  })
  scheduledAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Data/hora efetiva do envio'
  })
  sentAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Data/hora de entrega confirmada'
  })
  deliveredAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Data/hora de abertura (para emails)'
  })
  openedAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Data/hora de clique em links (para emails)'
  })
  clickedAt?: Date;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Dados adicionais específicos do contexto'
  })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}