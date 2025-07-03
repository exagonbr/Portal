export interface ClassChat {
  id: string;
  classId: string;
  messages: ChatMessage[];
  participants: string[]; // IDs de Usuários
  lastActivity: string; // Timestamp ISO
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  readBy: string[]; // IDs de Usuários
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
}

export enum ForumTagCategory {
  Question = 'Pergunta',
  Discussion = 'Discussão',
  Resource = 'Recurso',
  Assignment = 'Tarefa',
  Event = 'Evento',
  Announcement = 'Anúncio',
  Technical = 'Técnico',
  General = 'Geral'
}

export interface ForumThread {
  id: string;
  classId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  tags: ForumTagCategory[];
  attachments?: ForumAttachment[];
  replies: ForumReply[];
  pinned: boolean;
  locked: boolean;
  views: number;
}

export interface ForumReply {
  id: string;
  threadId: string;
  parentReplyId?: string; // Para respostas aninhadas
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  attachments?: ForumAttachment[];
  likes: string[]; // IDs de Usuários
}

export interface ForumAttachment {
  id: string;
  type: 'image' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  expiresAt?: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  scope: {
    type: 'global' | 'turma' | 'curso';
    targetId?: string; // classId ou courseId se não for global
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
  attachments?: AnnouncementAttachment[];
  acknowledgments: string[]; // IDs de Usuários que viram/reconheceram
}

export interface AnnouncementAttachment {
  id: string;
  type: 'image' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    announcements: boolean;
    forumReplies: boolean;
    chatMentions: boolean;
  };
  push: {
    announcements: boolean;
    forumReplies: boolean;
    chatMentions: boolean;
    chatMessages: boolean;
  };
}
