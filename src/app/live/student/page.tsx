'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  MessageSquare,
  Hand,
  Settings,
  Monitor,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LiveClass {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'live' | 'ended';
  participants: number;
  maxParticipants: number;
  description: string;
  meetingUrl?: string;
  recordingAvailable?: boolean;
}

export default function StudentLiveClassPage() {
  const { user } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
  const [isInClass, setIsInClass] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, time: string}>>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadLiveClasses();
  }, []);

  const loadLiveClasses = async () => {
    try {
      setLoading(true);
      
      // Dados simulados
      const mockClasses: LiveClass[] = [
        {
          id: '1',
          title: 'Matemática - Frações e Decimais',
          subject: 'Matemática',
          teacher: 'Prof. Maria Santos',
          startTime: '2025-01-30T14:00:00',
          endTime: '2025-01-30T15:00:00',
          status: 'live',
          participants: 18,
          maxParticipants: 30,
          description: 'Aula sobre conversão entre frações e decimais com exercícios práticos',
          meetingUrl: 'https://meet.example.com/math-class-1'
        },
        {
          id: '2',
          title: 'Português - Análise Sintática',
          subject: 'Português',
          teacher: 'Prof. Ana Lima',
          startTime: '2025-01-30T15:30:00',
          endTime: '2025-01-30T16:30:00',
          status: 'upcoming',
          participants: 0,
          maxParticipants: 25,
          description: 'Estudo dos termos da oração e suas funções sintáticas',
          meetingUrl: 'https://meet.example.com/portuguese-class-1'
        },
        {
          id: '3',
          title: 'Ciências - Sistema Solar',
          subject: 'Ciências',
          teacher: 'Prof. Carlos Silva',
          startTime: '2025-01-30T13:00:00',
          endTime: '2025-01-30T14:00:00',
          status: 'ended',
          participants: 22,
          maxParticipants: 30,
          description: 'Exploração dos planetas e suas características',
          recordingAvailable: true
        },
        {
          id: '4',
          title: 'História - Brasil Colonial',
          subject: 'História',
          teacher: 'Prof. Roberto Oliveira',
          startTime: '2025-01-31T09:00:00',
          endTime: '2025-01-31T10:00:00',
          status: 'upcoming',
          participants: 0,
          maxParticipants: 28,
          description: 'Período colonial brasileiro: economia e sociedade'
        }
      ];

      setLiveClasses(mockClasses);
    } catch (error) {
      console.log('Erro ao carregar aulas ao vivo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: LiveClass['status']) => {
    switch (status) {
      case 'live':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'upcoming':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'ended':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: LiveClass['status']) => {
    switch (status) {
      case 'live':
        return 'AO VIVO';
      case 'upcoming':
        return 'Agendada';
      case 'ended':
        return 'Finalizada';
      default:
        return 'Desconhecido';
    }
  };

  const joinClass = (classItem: LiveClass) => {
    setSelectedClass(classItem);
    setIsInClass(true);
    // Simular mensagens de chat
    setChatMessages([
      { id: '1', user: 'Prof. Maria Santos', message: 'Bem-vindos à aula de hoje!', time: '14:00' },
      { id: '2', user: 'João Silva', message: 'Boa tarde, professora!', time: '14:01' },
      { id: '3', user: 'Ana Costa', message: 'Estou animada para a aula', time: '14:02' }
    ]);
  };

  const leaveClass = () => {
    setIsInClass(false);
    setSelectedClass(null);
    setChatMessages([]);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        user: user?.name || 'Você',
        message: newMessage,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isInClass && selectedClass) {
    return (
      <div className="h-screen bg-gray-200 flex flex-col">
        {/* Header da Aula */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">AO VIVO</span>
            </div>
            <div>
              <h1 className="font-semibold">{selectedClass.title}</h1>
              <p className="text-sm text-gray-300">{selectedClass.teacher}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{selectedClass.participants} participantes</span>
            </div>
            <button
              onClick={leaveClass}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Área Principal do Vídeo */}
          <div className="flex-1 bg-black relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Monitor className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Compartilhamento de tela do professor</p>
                <p className="text-sm text-gray-400 mt-2">
                  {selectedClass.title} - {selectedClass.subject}
                </p>
              </div>
            </div>

            {/* Controles de Vídeo */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-800/80 backdrop-blur-sm rounded-lg p-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-2 rounded-lg transition-colors ${
                  isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isCameraOff ? <CameraOff className="w-5 h-5 text-white" /> : <Camera className="w-5 h-5 text-white" />}
              </button>
              <button className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                <Hand className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Chat Lateral */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat da Aula
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-primary">{msg.user}</span>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                  </div>
                  <p className="text-gray-700">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-700 mb-2 flex items-center gap-3">
          <Video className="w-8 h-8 text-primary" />
          Aulas ao Vivo
        </h1>
        <p className="text-gray-600">
          Participe das aulas em tempo real com seus professores e colegas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aulas Hoje</p>
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-800">
                {liveClasses.filter(c => new Date(c.startTime).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ao Vivo Agora</p>
              <p className="text-2xl font-bold text-red-600">
                {liveClasses.filter(c => c.status === 'live').length}
              </p>
            </div>
            <Video className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximas Aulas</p>
              <p className="text-2xl font-bold text-blue-600">
                {liveClasses.filter(c => c.status === 'upcoming').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Lista de Aulas */}
      <div className="space-y-4">
        {liveClasses.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma aula agendada</h3>
            <p className="text-gray-500">
              Não há aulas ao vivo programadas no momento.
            </p>
          </div>
        ) : (
          liveClasses.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(classItem.status)}`}>
                      {getStatusText(classItem.status)}
                    </span>
                    <span className="text-sm font-medium text-primary">{classItem.subject}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">{classItem.title}</h3>
                  <p className="text-gray-600 mb-3">{classItem.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(classItem.startTime).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(classItem.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(classItem.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{classItem.participants}/{classItem.maxParticipants} participantes</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <p className="text-sm text-gray-600">Prof. {classItem.teacher}</p>
                  
                  {classItem.status === 'live' && (
                    <button
                      onClick={() => joinClass(classItem)}
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Entrar na Aula
                    </button>
                  )}
                  
                  {classItem.status === 'upcoming' && (
                    <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Calendar className="w-4 h-4" />
                      Lembrar-me
                    </button>
                  )}
                  
                  {classItem.status === 'ended' && classItem.recordingAvailable && (
                    <button className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      <Play className="w-4 h-4" />
                      Ver Gravação
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 