export interface ForumThread {
  id: string;
  course_id?: string;
  title: string;
  content: string;
  author_id: string;
  tags?: string[];
  pinned: boolean;
  locked: boolean;
  views: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateForumThreadData {
  course_id?: string;
  title: string;
  content: string;
  author_id: string;
  tags?: string[];
  pinned?: boolean;
  locked?: boolean;
  views?: number;
}

export interface UpdateForumThreadData {
  course_id?: string;
  title?: string;
  content?: string;
  author_id?: string;
  tags?: string[];
  pinned?: boolean;
  locked?: boolean;
  views?: number;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  parent_reply_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateForumReplyData {
  thread_id: string;
  author_id: string;
  content: string;
  parent_reply_id?: string;
}

export interface UpdateForumReplyData {
  content?: string;
  parent_reply_id?: string;
}
