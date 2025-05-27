'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ChatMessage, ChatAttachment } from '@/types/communication'
import { mockTeachers, mockStudents, MOCK_USERS } from '@/constants/mockData'

interface ChatRoomProps {
  classId: string;
  className: string;
  initialMessages?: ChatMessage[];
}

export default function ChatRoom({ classId, className, initialMessages = [] }: ChatRoomProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getUserInfo = (userId: string) => {
    const users = Object.values(MOCK_USERS)
    const user = users.find(u => u.id === userId)
    if (user) return { name: user.name, role: user.role }
    
    return { name: 'Unknown User', role: 'unknown' }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && attachments.length === 0) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments,
      readBy: [user?.id || '']
    }

    // TODO: Replace with actual API call
    setMessages(prev => [...prev, message])
    setNewMessage('')
    setAttachments([])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // TODO: Replace with actual file upload logic
    const newAttachments: ChatAttachment[] = Array.from(files).map(file => ({
      id: Date.now().toString(),
      type: file.type.startsWith('image/') ? 'image' : 'document',
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }))

    setAttachments(prev => [...prev, ...newAttachments])
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{className}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => {
          const isOwnMessage = message.senderId === user?.id
          const userInfo = getUserInfo(message.senderId)

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg px-4 py-2`}
              >
                {!isOwnMessage && (
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {userInfo.name} ({userInfo.role})
                  </div>
                )}
                <p className="text-sm">{message.content}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <span className="material-symbols-outlined">
                          {attachment.type === 'image' ? 'image' : 'description'}
                        </span>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map(file => (
              <div
                key={file.id}
                className="flex items-center bg-gray-100 rounded px-2 py-1 text-sm"
              >
                <span className="material-symbols-outlined mr-1">
                  {file.type === 'image' ? 'image' : 'description'}
                </span>
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments(prev => prev.filter(f => f.id !== file.id))}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() && attachments.length === 0}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </form>
    </div>
  )
}
