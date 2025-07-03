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

  // Efeito para ajustar altura em dispositivos móveis
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    
    return () => {
      window.removeEventListener('resize', setVh);
    };
  }, []);

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
<<<<<<< HEAD
    <div className="flex w-full h-full overflow-hidden" >
      {/* Lista de Conversas */}
      <div className="w-64 lg:w-80 max-w-[320px] bg-white flex flex-col h-full border-r border-gray-200 overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-3 lg:p-4 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              <span className="hidden sm:inline">Mensagens</span>
            </h2>
            <button className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
            </button>
=======
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
>>>>>>> master
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
<<<<<<< HEAD
        <div className="flex-1 overflow-y-auto">
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
=======
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
>>>>>>> master
                    )}
                  </div>

<<<<<<< HEAD
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
=======
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
>>>>>>> master
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

<<<<<<< HEAD
      {/* Área de Chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Cabeçalho do Chat */}
          <div className="bg-white p-4 flex-shrink-0 border-b border-gray-200">
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
=======
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
>>>>>>> master
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
<<<<<<< HEAD
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
=======

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
>>>>>>> master
                </div>
              </div>
            </div>

<<<<<<< HEAD
          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
=======
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
>>>>>>> master
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
<<<<<<< HEAD
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <form onSubmit={handleSendMessage} className="bg-white p-4 flex-shrink-0 border-t border-gray-200">
            <div className="flex items-end gap-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
=======
              )}
>>>>>>> master
              
              <div ref={messagesEndRef} />
            </div>
<<<<<<< HEAD
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Selecione uma conversa para começar</p>
            <p className="text-gray-400 text-sm mt-2">Suas mensagens aparecerão aqui</p>
          </div>
        </div>
      )}
=======
>>>>>>> master

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
<<<<<<< HEAD
        <div className="w-64 lg:w-80 max-w-[320px] bg-white flex flex-col h-full border-l border-gray-200 overflow-hidden">
          <div className="p-3 lg:p-4 overflow-y-auto h-full">
            <div className="text-center mb-4 lg:mb-6">
              <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full mx-auto mb-2 lg:mb-3 flex items-center justify-center font-semibold text-white ${
                selectedConversation.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
              }`}>
=======
        <div className="w-80 border-l border-border-light bg-background-card">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
>>>>>>> master
                {selectedConversation.type === 'group' ? (
                  <Users className="w-10 h-10 text-white" />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {selectedConversation.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
<<<<<<< HEAD
              <h3 className="font-medium text-sm lg:text-base text-gray-700">{selectedConversation.name}</h3>
              {selectedConversation.type === 'direct' && (
                <p className="text-xs lg:text-sm text-gray-600">
                  {selectedConversation.participants[0]?.role}
                </p>
              )}
=======
              <h3 className="text-xl font-bold text-text-primary">
                {selectedConversation.name}
              </h3>
              <p className="text-text-tertiary">
                {selectedConversation.type === 'group' ? 'Grupo' : 'Conversa privada'}
              </p>
>>>>>>> master
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
<<<<<<< HEAD

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
=======
>>>>>>> master
          </div>
        </div>
      )}
    </div>
  );
}
