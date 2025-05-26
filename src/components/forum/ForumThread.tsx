import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ForumThread as ForumThreadType, ForumReply } from '@/types/communication'
import { mockTeachers, mockStudents } from '@/constants/mockData'

interface ForumThreadProps {
  thread: ForumThreadType
  onReply: (content: string, parentReplyId?: string) => void
}

export default function ForumThread({ thread, onReply }: ForumThreadProps) {
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  if (!user) return null

  const getAuthorName = (authorId: string) => {
    const teacher = mockTeachers.find(t => t.id === authorId)
    if (teacher) return teacher.name

    const student = mockStudents.find(s => s.id === authorId)
    if (student) return student.name

    return 'Unknown User'
  }

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault()
    onReply(replyContent, replyingTo || undefined)
    setReplyContent('')
    setShowReplyForm(false)
    setReplyingTo(null)
  }

  const renderReply = (reply: ForumReply, depth = 0) => {
    const authorName = getAuthorName(reply.authorId)
    const isAuthor = reply.authorId === user.id
    const hasLiked = reply.likes.includes(user.id)

    return (
      <div
        key={reply.id}
        className={`pl-${depth * 8} mt-4`}
        style={{ marginLeft: `${depth * 2}rem` }}
      >
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-semibold">{authorName}</span>
              <span className="text-gray-500 text-sm ml-2">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowReplyForm(true)
                  setReplyingTo(reply.id)
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Reply
              </button>
              {!thread.locked && isAuthor && (
                <button className="text-sm text-red-600 hover:text-red-800">
                  Delete
                </button>
              )}
            </div>
          </div>
          <div className="prose max-w-none">{reply.content}</div>
          <div className="mt-2 flex items-center space-x-4">
            <button
              className={`flex items-center space-x-1 text-sm ${
                hasLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{reply.likes.length}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderReplies = (replies: ForumReply[]) => {
    const threadReplies = new Map<string | undefined, ForumReply[]>()
    replies.forEach(reply => {
      const parent = reply.parentReplyId
      if (!threadReplies.has(parent)) {
        threadReplies.set(parent, [])
      }
      threadReplies.get(parent)!.push(reply)
    })

    const renderRepliesRecursive = (
      parentId: string | undefined,
      depth = 0
    ): JSX.Element[] => {
      const children = threadReplies.get(parentId) || []
      return children.map(reply => (
        <>
          {renderReply(reply, depth)}
          {renderRepliesRecursive(reply.id, depth + 1)}
        </>
      ))
    }

    return renderRepliesRecursive(undefined)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{thread.title}</h2>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span>{getAuthorName(thread.authorId)}</span>
              <span>{new Date(thread.createdAt).toLocaleString()}</span>
              <span>{thread.views} views</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {thread.pinned && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Pinned
              </span>
            )}
            {thread.locked && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                Locked
              </span>
            )}
          </div>
        </div>

        <div className="prose max-w-none mb-4">{thread.content}</div>

        <div className="flex flex-wrap gap-2 mb-4">
          {thread.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {thread.attachments && thread.attachments.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Attachments
            </h3>
            <div className="space-y-2">
              {thread.attachments.map(attachment => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{attachment.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200">
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Replies ({thread.replies.length})
            </h3>
            {!thread.locked && (
              <button
                onClick={() => {
                  setShowReplyForm(true)
                  setReplyingTo(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reply to Thread
              </button>
            )}
          </div>

          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                  {replyingTo && (
                    <span className="text-gray-500">
                      {' '}
                      - Replying to {getAuthorName(replyingTo)}
                    </span>
                  )}
                </label>
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false)
                    setReplyingTo(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Post Reply
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">{renderReplies(thread.replies)}</div>
        </div>
      </div>
    </div>
  )
}
