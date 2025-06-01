'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Circle,
  Users,
  Hash,
  Bell,
  BellOff,
  Star,
  Archive,
  Trash2,
  Settings,
  Plus,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  role?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    type: 'image' | 'file' | 'audio';
    url: string;
    name: string;
  }>;
}

interface ChatConversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar?: string;
  participants: ChatUser[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    // Dados simulados
    const mockConversations: ChatConversation[] = [
      {
        id: '1',
        type: 'direct',
        name: 'Prof. Ana Silva',
        avatar: '/avatars/ana.jpg',
        participants: [
          { id: '1', name: 'Prof. Ana Silva', status: 'online', role: 'Professor' }
        ],
        lastMessage: {
          content: 'Não esqueça da prova amanhã!',
          timestamp: new Date(),
          senderId: '1'
        },
        unreadCount: 2,
        isPinned: true,
        isMuted: false
      },
      {
        id: '2',
        type: 'group',
        name: '5º Ano A - Turma',
        participants: [
          { id: '1', name: 'Prof. Ana Silva', status: 'online', role: 'Professor' },
          { id: '2', name: 'João Pedro', status: 'online', role: 'Aluno' },
          { id: '3', name: 'Maria Clara', status: 'away', role: 'Aluno' }
        ],
        lastMessage: {
          content: 'João: Obrigado pela explicação!',
          timestamp: new Date(Date.now() - 3600000),
          senderId: '2'
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: false
      },
      {
        id: '3',
        type: 'direct',
        name: 'Coordenação',
        participants: [
          { id: '4', name: 'Coordenação', status: 'busy', role: 'Coordenador' }
        ],
        lastMessage: {
          content: 'Reunião confirmada para sexta',
          timestamp: new Date(Date.now() - 86400000),
          senderId: '4'
        },
        unreadCount: 0,
        isPinned: false,
        isMuted: true
      }
    ];

    setConversations(mockConversations);
    
    // Selecionar primeira conversa por padrão
    if (mockConversations.length > 0) {
      handleSelectConversation(mockConversations[0]);
    }
  };

  const handleSelectConversation = (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    
    // Marcar mensagens como lidas
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const loadMessages = (conversationId: string) => {
    // Dados simulados
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        senderId: '1',
        content: 'Olá! Como você está?',
        timestamp: new Date(Date.now() - 7200000),
        status: 'read'
      },
      {
        id: '2',
        senderId: 'current',
        content: 'Oi professora! Estou bem, obrigado!',
        timestamp: new Date(Date.now() - 7000000),
        status: 'read'
      },
      {
        id: '3',
        senderId: '1',
        content: 'Que bom! Queria lembrá-lo sobre a prova de matemática amanhã.',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read'
      },
      {
        id: '4',
        senderId: '1',
        content: 'Não esqueça de revisar os capítulos 5 e 6 do livro.',
        timestamp: new Date(Date.now() - 3500000),
        status: 'read'
      },
      {
        id: '5',
        senderId: 'current',
        content: 'Pode deixar! Já estou estudando.',
        timestamp: new Date(Date.now() - 1800000),
        status: 'delivered'
      }
    ];

    setMessages(mockMessages);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current',
      content: newMessage.trim(),
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simular entrega e leitura
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getStatusColor = (status: ChatUser['status']) => {
    switch (status) {
      case 'online': return 'bg-accent-green';
      case 'away': return 'bg-accent-yellow';
      case 'busy': return 'bg-error';
      default: return 'bg-text-muted';
    }
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sent': return <Check className="w-4 h-4 text-text-tertiary" />;
      case 'delivered': return <CheckCheck className="w-4 h-4 text-text-tertiary" />;
      case 'read': return <CheckCheck className="w-4 h-4 text-secondary" />;
      default: return null;
    }
  };

  return (
    <div className="h-screen bg-background-secondary flex overflow-hidden">
      {/* Sidebar de Conversas */}
      <div className="w-80 flex flex-col border-r border-border-light bg-background-card">
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-border-light bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-text-primary">Chat</h1>
            <div className="flex items-center gap-2">
              <button className="button-icon">
                <Settings className="w-5 h-5" />
              </button>
              <button className="button-icon">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field-modern pl-10"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {conversations
            .filter(conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 border-b border-border-light cursor-pointer transition-all duration-200 hover:bg-background-hover ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-primary/10 border-l-4 border-l-primary' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      {conversation.type === 'group' ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-white font-bold">
                          {conversation.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {conversation.type === 'direct' && conversation.participants[0] && (
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(conversation.participants[0].status)} rounded-full border-2 border-background-card`}></div>
                    )}
                  </div>

                  {/* Informações da Conversa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-text-primary truncate">
                        {conversation.name}
                        {conversation.isPinned && <Star className="w-4 h-4 text-accent-yellow ml-1 inline" />}
                        {conversation.isMuted && <BellOff className="w-4 h-4 text-text-muted ml-1 inline" />}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-text-tertiary">
                          {formatTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-text-secondary truncate">
                        {conversation.lastMessage?.content || 'Sem mensagens'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-secondary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Área Principal de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header do Chat */}
            <div className="p-6 border-b border-border-light bg-background-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      {selectedConversation.type === 'group' ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-white font-bold">
                          {selectedConversation.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {selectedConversation.type === 'direct' && selectedConversation.participants[0] && (
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(selectedConversation.participants[0].status)} rounded-full border-2 border-background-card`}></div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {selectedConversation.name}
                    </h2>
                    <p className="text-sm text-text-tertiary">
                      {selectedConversation.type === 'group' 
                        ? `${selectedConversation.participants.length} participantes`
                        : selectedConversation.participants[0]?.status || 'Offline'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="button-icon">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="button-icon">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="button-icon" onClick={() => setShowUserInfo(!showUserInfo)}>
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {messages.map((message, index) => {
                const isCurrentUser = message.senderId === 'current';
                const showTimestamp = index === 0 || 
                  new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000;

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="text-center text-xs text-text-muted py-2">
                        {formatDate(message.timestamp)} {formatTime(message.timestamp)}
                      </div>
                    )}
                    
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-primary to-primary-light text-white' 
                          : 'bg-background-card border border-border-light text-text-primary'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-text-tertiary'}`}>
                            {formatTime(message.timestamp)}
                          </span>
                          {isCurrentUser && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background-card border border-border-light rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Nova Mensagem */}
            <div className="p-6 border-t border-border-light bg-background-card">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button type="button" className="button-icon">
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="input-field-modern pr-12"
                  />
                  <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 button-icon">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="button-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          // Estado Vazio
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Bem-vindo ao Chat
              </h2>
              <p className="text-text-secondary">
                Selecione uma conversa para começar a enviar mensagens
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Painel de Informações do Usuário */}
      {showUserInfo && selectedConversation && (
        <div className="w-80 border-l border-border-light bg-background-card">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                {selectedConversation.type === 'group' ? (
                  <Users className="w-10 h-10 text-white" />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {selectedConversation.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                {selectedConversation.name}
              </h3>
              <p className="text-text-tertiary">
                {selectedConversation.type === 'group' ? 'Grupo' : 'Conversa privada'}
              </p>
            </div>

            <div className="space-y-4">
              <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-background-hover transition-colors text-left">
                <Bell className="w-5 h-5 text-text-secondary" />
                <span className="text-text-primary">Notificações</span>
              </button>
              
              <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-background-hover transition-colors text-left">
                <Star className="w-5 h-5 text-text-secondary" />
                <span className="text-text-primary">Mensagens Importantes</span>
              </button>
              
              <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-background-hover transition-colors text-left">
                <Archive className="w-5 h-5 text-text-secondary" />
                <span className="text-text-primary">Arquivar Conversa</span>
              </button>
              
              <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-error/10 hover:text-error transition-colors text-left">
                <Trash2 className="w-5 h-5" />
                <span>Excluir Conversa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
