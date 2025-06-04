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
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sent': return <Check className="w-4 h-4" />;
      case 'delivered': return <CheckCheck className="w-4 h-4" />;
      case 'read': return <CheckCheck className="w-4 h-4 text-blue-600" />;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-gray-50 full-screen-content">
      {/* Lista de Conversas */}
      <div className="w-64 lg:w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Cabeçalho */}
        <div className="p-3 lg:p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              <span className="hidden sm:inline">Mensagens</span>
            </h2>
            <button className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 lg:pl-10 pr-3 lg:pr-4 py-1.5 lg:py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`p-3 lg:p-4 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-l-4 ${
                selectedConversation?.id === conversation.id 
                  ? 'bg-blue-50 border-primary' 
                  : 'border-transparent hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-2 lg:gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                    conversation.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}>
                    {conversation.type === 'group' ? (
                      <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                    ) : (
                      <span className="text-xs lg:text-sm">
                        {conversation.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {conversation.type === 'direct' && (
                    <div className={`absolute bottom-0 right-0 w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full border-2 border-white ${
                      getStatusColor(conversation.participants[0]?.status || 'offline')
                    }`} />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-700 truncate flex items-center gap-1">
                      {conversation.isPinned && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 truncate">
                      {conversation.lastMessage?.content}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {conversation.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
                      {conversation.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full font-medium min-w-[20px] text-center">
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Cabeçalho do Chat */}
          <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white ${
                    selectedConversation.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}>
                    {selectedConversation.type === 'group' ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <span className="text-sm">
                        {selectedConversation.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {selectedConversation.type === 'direct' && (
                    <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${
                      getStatusColor(selectedConversation.participants[0]?.status || 'offline')
                    }`} />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-700 truncate">{selectedConversation.name}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.type === 'group' 
                      ? `${selectedConversation.participants.length} participantes`
                      : selectedConversation.participants[0]?.status === 'online' 
                        ? 'Online agora' 
                        : 'Offline'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={() => setShowUserInfo(!showUserInfo)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === 'current';
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

              return (
                <React.Fragment key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="px-3 py-1 text-xs bg-white text-gray-600 rounded-full shadow-sm">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 shadow-sm ${
                      isCurrentUser 
                        ? 'bg-primary text-white' 
                        : 'bg-white text-gray-600'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
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
                <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <Circle className="w-2 h-2 fill-gray-400 animate-bounce" />
                    <Circle className="w-2 h-2 fill-gray-400 animate-bounce delay-100" />
                    <Circle className="w-2 h-2 fill-gray-400 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="w-full px-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700"
                />
              </div>
              
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Selecione uma conversa para começar</p>
            <p className="text-gray-400 text-sm mt-2">Suas mensagens aparecerão aqui</p>
          </div>
        </div>
      )}

      {/* Painel de Informações */}
      {showUserInfo && selectedConversation && (
        <div className="w-64 lg:w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-3 lg:p-4">
            <div className="text-center mb-4 lg:mb-6">
              <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full mx-auto mb-2 lg:mb-3 flex items-center justify-center font-semibold text-white ${
                selectedConversation.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
                {selectedConversation.type === 'group' ? (
                  <Users className="w-7 h-7 lg:w-8 lg:h-8" />
                ) : (
                  <span className="text-lg lg:text-xl">
                    {selectedConversation.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="font-medium text-sm lg:text-base text-gray-700">{selectedConversation.name}</h3>
              {selectedConversation.type === 'direct' && (
                <p className="text-xs lg:text-sm text-gray-600">
                  {selectedConversation.participants[0]?.role}
                </p>
              )}
            </div>

            <div className="space-y-1 lg:space-y-2">
              <button className="w-full p-2 lg:p-3 hover:bg-gray-50 rounded-lg flex items-center gap-2 lg:gap-3 transition-colors text-gray-700">
                {selectedConversation.isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                <span className="text-xs lg:text-sm">{selectedConversation.isMuted ? 'Ativar notificações' : 'Silenciar'}</span>
              </button>
              
              <button className="w-full p-2 lg:p-3 hover:bg-gray-50 rounded-lg flex items-center gap-2 lg:gap-3 transition-colors text-gray-700">
                <Star className="w-4 h-4" />
                <span className="text-xs lg:text-sm">{selectedConversation.isPinned ? 'Desafixar' : 'Fixar'} conversa</span>
              </button>
              
              <button className="w-full p-2 lg:p-3 hover:bg-gray-50 rounded-lg flex items-center gap-2 lg:gap-3 transition-colors text-gray-700">
                <Archive className="w-4 h-4" />
                <span className="text-xs lg:text-sm">Arquivar conversa</span>
              </button>
              
              <button className="w-full p-2 lg:p-3 hover:bg-red-50 rounded-lg flex items-center gap-2 lg:gap-3 transition-colors text-red-600">
                <Trash2 className="w-4 h-4" />
                <span className="text-xs lg:text-sm">Apagar conversa</span>
              </button>
            </div>

            {selectedConversation.type === 'group' && (
              <div className="mt-4 lg:mt-6">
                <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-3">Participantes ({selectedConversation.participants.length})</h4>
                <div className="space-y-1 lg:space-y-2">
                  {selectedConversation.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gray-300 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-blue-400 to-blue-600">
                          <span className="text-xs font-medium">
                            {participant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full border border-white ${
                          getStatusColor(participant.status)
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs lg:text-sm font-medium text-gray-700 truncate">{participant.name}</p>
                        <p className="text-xs text-gray-500">{participant.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
