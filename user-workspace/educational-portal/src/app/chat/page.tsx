'use client'

import { useState } from 'react'

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState<number | null>(1)
  const [message, setMessage] = useState('')

  const chats = [
    {
      id: 1,
      name: 'Mathematics Study Group',
      lastMessage: 'Can someone explain derivatives?',
      time: '5m ago',
      unread: 3,
      type: 'group',
    },
    {
      id: 2,
      name: 'Dr. Sarah Johnson',
      lastMessage: 'Your last assignment was excellent!',
      time: '1h ago',
      unread: 0,
      type: 'private',
    },
    {
      id: 3,
      name: 'Physics Lab Group',
      lastMessage: 'Meeting tomorrow at 10 AM',
      time: '2h ago',
      unread: 1,
      type: 'group',
    },
  ]

  const messages = [
    {
      id: 1,
      sender: 'John Doe',
      content: 'Can someone explain derivatives?',
      time: '10:00 AM',
      isSelf: false,
    },
    {
      id: 2,
      sender: 'You',
      content: 'Sure! A derivative measures the rate of change of a function with respect to its variable.',
      time: '10:02 AM',
      isSelf: true,
    },
    {
      id: 3,
      sender: 'Emily Brown',
      content: 'Here\'s a helpful link to visualize derivatives: [link]',
      time: '10:05 AM',
      isSelf: false,
    },
  ]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      // Add message handling logic here
      setMessage('')
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-y-auto h-full">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                selectedChat === chat.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  chat.type === 'group' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {chat.type === 'group' ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">{chat.name}</p>
                  <p className="text-xs text-gray-500">{chat.time}</p>
                </div>
                <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                  {chat.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-gray-900">
                  {chats.find(chat => chat.id === selectedChat)?.name}
                </h2>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${
                    msg.isSelf
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900'
                  } rounded-lg px-4 py-2 shadow`}>
                    {!msg.isSelf && (
                      <p className="text-xs font-medium text-gray-500">{msg.sender}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs ${
                      msg.isSelf ? 'text-blue-100' : 'text-gray-500'
                    } text-right mt-1`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}
