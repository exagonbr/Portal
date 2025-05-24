'use client'

import { useState } from 'react'
import { mockChats, mockTeachers, mockStudents } from '@/constants/mockData'

interface ChatSectionProps {
  userId: string
}

export default function ChatSection({ userId }: ChatSectionProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  const userChats = mockChats.filter(chat => 
    chat.participants.includes(userId)
  )

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
