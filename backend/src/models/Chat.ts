export interface Chat {
  id: string;
  name: string;
  course_id?: string;
  participants: string[];
  last_message?: string;
  last_message_time?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateChatData {
  name: string;
  course_id?: string;
  participants: string[];
  last_message?: string;
  last_message_time?: Date;
}

export interface UpdateChatData {
  name?: string;
  course_id?: string;
  participants?: string[];
  last_message?: string;
  last_message_time?: Date;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  read_by: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateChatMessageData {
  chat_id: string;
  sender_id: string;
  content: string;
  read_by?: string[];
}

export interface UpdateChatMessageData {
  content?: string;
  read_by?: string[];
}
