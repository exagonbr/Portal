'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockChats, mockTeachers, mockStudents } from '@/constants/mockData'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useState } from 'react'

export default function Chat() {
  const { user, loading } = useAuth()
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!user || user.type !== 'student') {
    redirect('/dashboard')
  }

  const userChats = mockChats.filter(chat => 
    chat.participants.includes(user.id)
  )

  const getParticipantInfo = (participantId: string) => {
    if (participantId.startsWith('t')) {
      return mockTeachers.find(t => t.id === participantId)
    }
    return mockStudents.find(s => s.id === participantId)
  }

  const selectedChatData = userChats.find(chat => chat.id === selectedChat)

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Portal do Aluno</h2>
          <p className="text-sm opacity-75">{user.name}</p>
        </div>
        <nav className="space-y-4">
          <Link href="/dashboard/student" className="nav-link block">
            Dashboard
          </Link>
          <Link href="/courses" className="nav-link block">
            Cursos
          </Link>
          <Link href="/assignments" className="nav-link block">
            Atividades
          </Link>
          <Link href="/live" className="nav-link block">
            Aulas ao Vivo
          </Link>
          <Link href="/chat" className="nav-link active block">
            Chat
          </Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="text-2xl font-bold text-[#1B365D]">Mensagens</h1>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat List */}
          <div className="col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Buscar conversas..."
                className="input-field w-full"
              />
            </div>
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {userChats.map(chat => {
                const otherParticipant = getParticipantInfo(
                  chat.participants.find(p => p !== user.id) || ''
                )
                const lastMessage = chat.messages[chat.messages.length - 1]

                return (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors
                      ${selectedChat === chat.id ? 'bg-[#F7FAFC]' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1B365D] truncate">
                          {otherParticipant?.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {lastMessage?.content}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(lastMessage?.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
            {selectedChatData ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-[#1B365D]">
                    {getParticipantInfo(
                      selectedChatData.participants.find(p => p !== user.id) || ''
                    )?.name}
                  </h2>
                </div>
                <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-4">
                  {selectedChatData.messages.map(message => {
                    const isOwn = message.sender === user.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn
                              ? 'bg-[#1B365D] text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-blue-200' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-4 border-t border-gray-200">
                  <form className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      className="input-field flex-1"
                    />
                    <button type="submit" className="btn-primary">
                      Enviar
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Selecione uma conversa para começar
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
