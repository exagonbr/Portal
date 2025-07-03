'use client'

import { useState } from 'react'

// Dados mock locais
const mockChats = [
  {
    id: '1',
    name: 'Prof. João Silva',
    lastMessage: 'Boa tarde! Como está o projeto?',
    timestamp: '14:30',
    unread: 2,
    avatar: '/avatars/teacher1.jpg',
    participants: ['user1', 'teacher1']
  },
  {
    id: '2',
    name: 'Maria Santos',
    lastMessage: 'Obrigada pela explicação!',
    timestamp: '13:45',
    unread: 0,
    avatar: '/avatars/student1.jpg',
    participants: ['user1', 'student1']
  }
]

const mockTeachers = [
  { id: '1', name: 'Prof. João Silva', subject: 'Matemática' },
  { id: '2', name: 'Prof. Ana Costa', subject: 'Português' }
]

const mockStudents = [
  { id: '1', name: 'Maria Santos', class: '9º A' },
  { id: '2', name: 'Pedro Lima', class: '8º B' }
]

interface ChatSectionProps {
  userId: string
}

export default function ChatSection({ userId }: ChatSectionProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  const userChats = mockChats // Simplificado - mostra todos os chats

  const getParticipantInfo = (participantId: string) => {
    if (participantId.startsWith('t')) {
      return mockTeachers.find(t => t.id === participantId)
    }
    return mockStudents.find(s => s.id === participantId)
  }

  const selectedChatData = userChats.find(chat => chat.id === selectedChat)

  return (
    <div className="grid grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Chat List */}
      
    </div>
  )
}
