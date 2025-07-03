export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'academic' | 'system' | 'social' | 'administrative';
  priority: 'low' | 'medium' | 'high';
  sender_id: string;
  recipient_id?: string;
  recipient_type: 'all' | 'role' | 'specific';
  recipient_roles?: string[];
  delivery_methods: ('in_app' | 'email' | 'push')[];
  scheduled_for?: Date;
  sent_at?: Date;
  read_at?: Date;
  metadata?: any;
  status: 'pending' | 'scheduled' | 'sent' | 'delivered' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'academic' | 'system' | 'social' | 'administrative';
  priority: 'low' | 'medium' | 'high';
  sender_id: string;
  recipient_id?: string;
  recipient_type: 'all' | 'role' | 'specific';
  recipient_roles?: string[];
  delivery_methods: ('in_app' | 'email' | 'push')[];
  scheduled_for?: Date;
  metadata?: any;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  category?: 'academic' | 'system' | 'social' | 'administrative';
  priority?: 'low' | 'medium' | 'high';
  recipient_id?: string;
  recipient_type?: 'all' | 'role' | 'specific';
  recipient_roles?: string[];
  delivery_methods?: ('in_app' | 'email' | 'push')[];
  scheduled_for?: Date;
  sent_at?: Date;
  read_at?: Date;
  metadata?: any;
  status?: 'pending' | 'scheduled' | 'sent' | 'delivered' | 'failed';
}

export interface NotificationFilters {
  category?: string;
  type?: string;
  status?: string;
  recipient_id?: string;
  sender_id?: string;
  date_range?: string;
  unread_only?: boolean;
}

export interface NotificationWithSender extends Notification {
  sender_name?: string;
  sender_email?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: {
    info: number;
    warning: number;
    success: number;
    error: number;
  };
  by_category: {
    academic: number;
    system: number;
    social: number;
    administrative: number;
  };
  by_status: {
    pending: number;
    scheduled: number;
    sent: number;
    delivered: number;
    failed: number;
  };
}

export interface BulkNotificationData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'academic' | 'system' | 'social' | 'administrative';
  priority: 'low' | 'medium' | 'high';
  sender_id: string;
  recipients: {
    type: 'all' | 'role' | 'specific';
    roles?: string[];
    user_ids?: string[];
  };
  delivery_methods: ('in_app' | 'email' | 'push')[];
  scheduled_for?: Date;
  metadata?: any;
}

export interface NotificationJob {
  notification_id: string;
  recipient_id: string;
  delivery_method: 'in_app' | 'email' | 'push';
  priority: number;
  scheduled_for?: Date;
  attempts: number;
  max_attempts: number;
  last_error?: string;
  metadata?: any;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  priority: 'low' | 'medium' | 'high';
  notification_id: string;
  user_id: string;
  metadata?: any;
}

export interface PushNotificationData {
  user_id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: number;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  notification_id: string;
  metadata?: any;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'in_app';
  subject_template?: string;
  body_template: string;
  variables: string[];
  category: 'academic' | 'system' | 'social' | 'administrative';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  category: 'academic' | 'system' | 'social' | 'administrative';
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationDelivery {
  id: string;
  notification_id: string;
  recipient_id: string;
  delivery_method: 'in_app' | 'email' | 'push';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sent_at?: Date;
  delivered_at?: Date;
  failed_at?: Date;
  error_message?: string;
  attempts: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}