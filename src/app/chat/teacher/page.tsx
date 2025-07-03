'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Search,
  Phone,
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  Circle,
  Clock,
  CheckCheck,
  Star,
  BookOpen,
  Calendar,
  MessageSquare,
  Users,
  Filter,
  ArrowLeft,
  Image as ImageIcon,
  File,
  Mic,
  Camera,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen?: Date;
  rating: number;
  responseTime: string;
  specialties: string[];
  isAvailable: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'audio';
  attachments?: Array<{
    type: 'image' | 'file' | 'audio';
    url: string;
    name: string;
    size?: number;
  }>;
}

interface Conversation {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  subject: string;
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
  isActive: boolean;
}

export default function ChatWithTeacherPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('todos');
  const [isTyping, setIsTyping] = useState(false);
  const [showTeacherList, setShowTeacherList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTeachers();
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTeachers = async () => {
    try {
      const mockTeachers: Teacher[] = [
        {
          id: 't1',
          name: 'Prof. Ana Silva',
          subject: 'Matemática',
          avatar: '/avatars/ana.jpg',
          status: 'online',
          rating: 4.9,
          responseTime: '~5 min',
          specialties: ['Álgebra', 'Geometria', 'Cálculo'],
          isAvailable: true
        },
        {
          id: 't2',
          name: 'Prof. Carlos Santos',
          subject: 'Português',
          avatar: '/avatars/carlos.jpg',
          status: 'online',
          rating: 4.8,
          responseTime: '~10 min',
          specialties: ['Literatura', 'Gramática', 'Redação'],
          isAvailable: true
        },
        {
          id: 't3',
          name: 'Prof. Maria Oliveira',
          subject: 'Física',
          avatar: '/avatars/maria.jpg',
          status: 'busy',
          rating: 4.7,
          responseTime: '~15 min',
          specialties: ['Mecânica', 'Eletricidade', 'Óptica'],
          isAvailable: false
        },
        {
          id: 't4',
          name: 'Prof. João Pedro',
          subject: 'História',
          avatar: '/avatars/joao.jpg',
          status: 'away',
          lastSeen: new Date(Date.now() - 1800000),
          rating: 4.6,
          responseTime: '~20 min',
          specialties: ['Brasil Colonial', 'República', 'História Geral'],
          isAvailable: true
        },
        {
          id: 't5',
          name: 'Prof. Lucia Costa',
          subject: 'Química',
          avatar: '/avatars/lucia.jpg',
          status: 'offline',
          lastSeen: new Date(Date.now() - 3600000),
          rating: 4.8,
          responseTime: '~30 min',
          specialties: ['Orgânica', 'Inorgânica', 'Físico-Química'],
          isAvailable: false
        }
      ];

      setTeachers(mockTeachers);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const mockConversations: Conversation[] = [
        {
          id: 'c1',
          teacherId: 't1',
          teacherName: 'Prof. Ana Silva',
          teacherAvatar: '/avatars/ana.jpg',
          subject: 'Matemática',
          lastMessage: {
            content: 'Claro! Vou explicar novamente os logaritmos.',
            timestamp: new Date(Date.now() - 300000),
            senderId: 't1'
          },
          unreadCount: 1,
          isActive: true
        },
        {
          id: 'c2',
          teacherId: 't2',
          teacherName: 'Prof. Carlos Santos',
          teacherAvatar: '/avatars/carlos.jpg',
          subject: 'Português',
          lastMessage: {
            content: 'Sua redação está muito boa! Apenas alguns ajustes.',
            timestamp: new Date(Date.now() - 1800000),
            senderId: 't2'
          },
          unreadCount: 0,
          isActive: false
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const loadMessages = (conversationId: string) => {
    const mockMessages: ChatMessage[] = [
      {
        id: 'm1',
        senderId: 't1',
        senderName: 'Prof. Ana Silva',
        content: 'Olá! Como posso ajudá-lo hoje?',
        timestamp: new Date(Date.now() - 1800000),
        status: 'read',
        type: 'text'
      },
      {
        id: 'm2',
        senderId: user?.id || 'student',
        senderName: 'Você',
        content: 'Oi professora! Estou com dúvida nos logaritmos.',
        timestamp: new Date(Date.now() - 1500000),
        status: 'read',
        type: 'text'
      },
      {
        id: 'm3',
        senderId: 't1',
        senderName: 'Prof. Ana Silva',
        content: 'Perfeito! Qual parte específica dos logaritmos você gostaria de revisar?',
        timestamp: new Date(Date.now() - 1200000),
        status: 'read',
        type: 'text'
      },
      {
        id: 'm4',
        senderId: user?.id || 'student',
        senderName: 'Você',
        content: 'Principalmente as propriedades e como aplicar nas equações.',
        timestamp: new Date(Date.now() - 900000),
        status: 'read',
        type: 'text'
      },
      {
        id: 'm5',
        senderId: 't1',
        senderName: 'Prof. Ana Silva',
        content: 'Claro! Vou explicar novamente os logaritmos.',
        timestamp: new Date(Date.now() - 300000),
        status: 'delivered',
        type: 'text'
      }
    ];

    setMessages(mockMessages);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'todos' || teacher.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const handleStartChat = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowTeacherList(false);
    
    // Verificar se já existe conversa com este professor
    const existingConversation = conversations.find(conv => conv.teacherId === teacher.id);
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
      loadMessages(existingConversation.id);
    } else {
      // Criar nova conversa
      const newConversation: Conversation = {
        id: `c${Date.now()}`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherAvatar: teacher.avatar,
        subject: teacher.subject,
        unreadCount: 0,
        isActive: true
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setMessages([]);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSelectedTeacher(teachers.find(t => t.id === conversation.teacherId) || null);
    setShowTeacherList(false);
    loadMessages(conversation.id);
    
    // Marcar como lida
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    const message: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: user?.id || 'student',
      senderName: 'Você',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Atualizar última mensagem da conversa
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            lastMessage: {
              content: newMessage,
              timestamp: new Date(),
              senderId: user?.id || 'student'
            }
          }
        : conv
    ));

    // Simular resposta do professor após 2-5 segundos
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        const responses = [
          'Entendi sua dúvida! Vou explicar passo a passo.',
          'Ótima pergunta! Isso é muito importante.',
          'Vamos resolver isso juntos.',
          'Posso enviar alguns exercícios para praticar.',
          'Tem mais alguma dúvida sobre este tópico?'
        ];
        
        const response: ChatMessage = {
          id: `m${Date.now()}`,
          senderId: selectedTeacher?.id || 'teacher',
          senderName: selectedTeacher?.name || 'Professor',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          status: 'sent',
          type: 'text'
        };

        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 1500);
    }, Math.random() * 3000 + 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (teacher: Teacher) => {
    switch (teacher.status) {
      case 'online': return 'Online';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      case 'offline': 
        return teacher.lastSeen 
          ? `Visto por último ${teacher.lastSeen.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
          : 'Offline';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Chat com Professores</h1>
                <p className="text-gray-600 mt-1">
                  Tire suas dúvidas diretamente com os professores
                </p>
              </div>
              {!showTeacherList && (
                <button
                  onClick={() => setShowTeacherList(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar - Lista de Professores ou Conversas */}
          <div className={`${showTeacherList ? 'w-full md:w-1/3' : 'w-80'} bg-white border-r border-gray-200 flex flex-col`}>
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={showTeacherList ? "Buscar professores..." : "Buscar conversas..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                
                {showTeacherList && (
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  >
                    <option value="todos">Todas as Matérias</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Português">Português</option>
                    <option value="Física">Física</option>
                    <option value="História">História</option>
                    <option value="Química">Química</option>
                    <option value="Biologia">Biologia</option>
                  </select>
                )}
              </div>
            </div>

            {/* Lista de Professores ou Conversas */}
            <div className="flex-1 overflow-y-auto">
              {showTeacherList ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Professores Disponíveis</h3>
                    <span className="text-sm text-gray-500">
                      {filteredTeachers.length} encontrados
                    </span>
                  </div>
                  
                  {filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      onClick={() => handleStartChat(teacher)}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(teacher.status)} rounded-full border-2 border-white`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-700 truncate">{teacher.name}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-gray-600">{teacher.rating}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{teacher.subject}</p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{getStatusText(teacher)}</span>
                            <span>Responde em {teacher.responseTime}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {teacher.specialties.slice(0, 2).map((specialty) => (
                              <span key={specialty} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {specialty}
                              </span>
                            ))}
                            {teacher.specialties.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{teacher.specialties.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700">Conversas Recentes</h3>
                  </div>
                  
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        selectedConversation?.id === conversation.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-700 truncate">{conversation.teacherName}</h4>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-1">{conversation.subject}</p>
                          
                          {conversation.lastMessage && (
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage.content}
                              </p>
                              <span className="text-xs text-gray-400 ml-2">
                                {conversation.lastMessage.timestamp.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {!showTeacherList && selectedConversation && selectedTeacher && (
            <div className="flex-1 flex flex-col bg-white">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(selectedTeacher.status)} rounded-full border-2 border-white`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">{selectedTeacher.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTeacher.subject} • {getStatusText(selectedTeacher)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === (user?.id || 'student');
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isOwnMessage
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700'
                        } rounded-lg px-4 py-2`}
                      >
                        {!isOwnMessage && (
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            {message.senderName}
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          isOwnMessage ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isOwnMessage && (
                            <CheckCheck className={`w-3 h-3 ${
                              message.status === 'read' ? 'text-blue-300' : 'text-white/70'
                            }`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{selectedTeacher.name} está digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-6 py-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!showTeacherList && !selectedConversation && (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Selecione um professor para conversar
                </h3>
                <p className="text-gray-600">
                  Escolha um professor da lista para iniciar uma conversa
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 