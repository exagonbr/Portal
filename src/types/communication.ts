export interface ClassChat {
  id: string;
  classId: string;
  messages: ChatMessage[];
  participants: string[]; // User IDs
  lastActivity: string; // ISO timestamp
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  readBy: string[]; // User IDs
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
}

export enum ForumTagCategory {
  Question = 'Question',
  Discussion = 'Discussion',
  Resource = 'Resource',
  Assignment = 'Assignment',
  Event = 'Event',
  Announcement = 'Announcement',
  Technical = 'Technical',
  General = 'General'
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
  parentReplyId?: string; // For nested replies
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  attachments?: ForumAttachment[];
  likes: string[]; // User IDs
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
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scope: {
    type: 'global' | 'class' | 'course';
    targetId?: string; // classId or courseId if not global
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
  attachments?: AnnouncementAttachment[];
  acknowledgments: string[]; // User IDs who have seen/acknowledged
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
