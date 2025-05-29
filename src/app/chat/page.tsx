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
      },
      {
        id: '6',
        senderId: '1',
        content: 'Não esqueça da prova amanhã!',
        timestamp: new Date(),
        status: 'sent'
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
      content: newMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simular mudança de status da mensagem
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'read' } : msg
      ));
    }, 2000);
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
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      case 'busy': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sent': return <Check className="w-4 h-4" />;
      case 'delivered': return <CheckCheck className="w-4 h-4" />;
      case 'read': return <CheckCheck className="w-4 h-4 text-indigo-500" />;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-100 bg-gray-900">
      {/* Lista de Conversas */}
      <div className="w-80 bg-white bg-gray-800 border-r border-slate-200 border-gray-700 flex flex-col">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-200 border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Mensagens</h2>
            <button className="p-2 hover:bg-slate-100 hover:bg-gray-700 rounded-lg">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`p-4 hover:bg-slate-50 hover:bg-gray-700 cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-slate-50 bg-gray-700' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center">
                    {conversation.type === 'group' ? (
                      <Users className="w-6 h-6 text-slate-600" />
                    ) : (
                      <span className="text-lg font-semibold">
                        {conversation.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {conversation.type === 'direct' && (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      getStatusColor(conversation.participants[0]?.status || 'offline')
                    }`} />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">
                      {conversation.isPinned && <Star className="inline w-3 h-3 mr-1 text-yellow-500" />}
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 text-gray-400 truncate">
                      {conversation.lastMessage?.content}
                    </p>
                    <div className="flex items-center gap-2">
                      {conversation.isMuted && <BellOff className="w-3 h-3 text-slate-400" />}
                      {conversation.unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de Chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Cabeçalho do Chat */}
          <div className="bg-white bg-gray-800 border-b border-slate-200 border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                    {selectedConversation.type === 'group' ? (
                      <Users className="w-5 h-5 text-slate-600" />
                    ) : (
                      <span className="font-semibold">
                        {selectedConversation.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {selectedConversation.type === 'direct' && (
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      getStatusColor(selectedConversation.participants[0]?.status || 'offline')
                    }`} />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedConversation.name}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedConversation.type === 'group' 
                      ? `${selectedConversation.participants.length} participantes`
                      : selectedConversation.participants[0]?.status === 'online' 
                        ? 'Online' 
                        : 'Offline'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 hover:bg-gray-700 rounded-lg">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-100 hover:bg-gray-700 rounded-lg">
              <Video className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowUserInfo(!showUserInfo)}
              className="p-2 hover:bg-slate-100 hover:bg-gray-700 rounded-lg"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === 'current';
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="px-3 py-1 text-xs bg-slate-200 bg-gray-700 rounded-full">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${
                      isCurrentUser 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-200 dark:bg-gray-700 text-slate-900 dark:text-white'
                    } rounded-lg px-4 py-2`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        isCurrentUser ? 'text-indigo-100' : 'text-slate-500'
                      }`}>
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {isCurrentUser && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <Circle className="w-2 h-2 fill-current animate-bounce" />
                    <Circle className="w-2 h-2 fill-current animate-bounce delay-100" />
                    <Circle className="w-2 h-2 fill-current animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <form onSubmit={handleSendMessage} className="bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 p-4">
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <button
                type="button"
                className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">Selecione uma conversa para começar</p>
          </div>
        </div>
      )}

      {/* Painel de Informações */}
      {showUserInfo && selectedConversation && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-slate-200 dark:border-gray-700 p-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-slate-300 rounded-full mx-auto mb-3 flex items-center justify-center">
              {selectedConversation.type === 'group' ? (
                <Users className="w-10 h-10 text-slate-600" />
              ) : (
                <span className="text-2xl font-semibold">
                  {selectedConversation.name.charAt(0)}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg">{selectedConversation.name}</h3>
            {selectedConversation.type === 'direct' && (
              <p className="text-sm text-slate-500">
                {selectedConversation.participants[0]?.role}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <button className="w-full p-3 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
              {selectedConversation.isMuted ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              <span>{selectedConversation.isMuted ? 'Ativar notificações' : 'Silenciar'}</span>
            </button>
            
            <button className="w-full p-3 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
              <Star className="w-5 h-5" />
              <span>{selectedConversation.isPinned ? 'Desafixar' : 'Fixar'} conversa</span>
            </button>
            
            <button className="w-full p-3 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
              <Archive className="w-5 h-5" />
              <span>Arquivar conversa</span>
            </button>
            
            <button className="w-full p-3 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3 text-red-600">
              <Trash2 className="w-5 h-5" />
              <span>Apagar conversa</span>
            </button>
          </div>

          {selectedConversation.type === 'group' && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Participantes ({selectedConversation.participants.length})</h4>
              <div className="space-y-2">
                {selectedConversation.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2">
                    <div className="relative">
                      <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {participant.name.charAt(0)}
                        </span>
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${
                        getStatusColor(participant.status)
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{participant.name}</p>
                      <p className="text-xs text-slate-500">{participant.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
