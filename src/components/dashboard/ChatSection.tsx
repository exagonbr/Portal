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
      <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 material-symbols-outlined">search</span>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {userChats.map(chat => {
            const otherParticipant = getParticipantInfo(
              chat.participants.find(p => p !== userId) || ''
            )
            const lastMessage = chat.messages[chat.messages.length - 1]

            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors
                  ${selectedChat === chat.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">person</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
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
      <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {selectedChatData ? (
          <>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">person</span>
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  {getParticipantInfo(
                    selectedChatData.participants.find(p => p !== userId) || ''
                  )?.name}
                </h2>
              </div>
            </div>
            <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-4">
              {selectedChatData.messages.map(message => {
                const isOwn = message.sender === userId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
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
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <span className="material-symbols-outlined">send</span>
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <span className="material-symbols-outlined text-6xl">chat</span>
            <p>Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}
