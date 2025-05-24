'use client'

interface ChatMessage {
  name: string
  message: string
  avatar: string
}

export default function ChatSection() {
  const messages: ChatMessage[] = [
    {
      name: 'Debra Young',
      message: "How's my product?",
      avatar: 'DY'
    },
    {
      name: 'Dorothy Collins',
      message: 'How was the meeting',
      avatar: 'DC'
    },
    {
      name: 'Chris Jordan',
      message: 'How employee performance',
      avatar: 'CJ'
    },
    {
      name: 'Denise Murphy',
      message: 'How was the meeting',
      avatar: 'DM'
    }
  ]

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Chat</h2>
      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white">
              {msg.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{msg.name}</h3>
              <p className="text-sm text-gray-500">{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
