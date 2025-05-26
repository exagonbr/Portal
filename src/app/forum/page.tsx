'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { mockCourses, mockForumThreads } from '@/constants/mockData'
import { ForumThread as ForumThreadType, ForumTagCategory } from '@/types/communication'
import ForumThread from '@/components/forum/ForumThread'

export default function ForumPage() {
  const { user } = useAuth()
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<ForumTagCategory[]>([])
  const [showNewThreadForm, setShowNewThreadForm] = useState(false)
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    tags: [] as ForumTagCategory[],
    classId: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [threads, setThreads] = useState(mockForumThreads)

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">Please log in to view the forum.</p>
        </div>
      </div>
    )
  }

  const userClasses = mockCourses.filter(course => {
    if (user.type === 'teacher') {
      return course.teachers.includes(user.id)
    } else {
      return course.students.includes(user.id)
    }
  })

  const filteredThreads = threads.filter(thread => {
    const matchesClass = !selectedClass || thread.classId === selectedClass
    const matchesTags = selectedTags.length === 0 || 
      thread.tags.some(tag => selectedTags.includes(tag))
    return matchesClass && matchesTags
  })

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newThread.classId) {
      setError('Please select a class')
      return
    }

    if (newThread.tags.length === 0) {
      setError('Please select at least one tag')
      return
    }

    // Create new thread
    const thread: ForumThreadType = {
      id: `ft${threads.length + 1}`,
      classId: newThread.classId,
      title: newThread.title,
      content: newThread.content,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: newThread.tags,
      attachments: [],
      replies: [],
      pinned: false,
      locked: false,
      views: 0
    }

    // In a real app, this would be an API call
    setThreads([...threads, thread])

    // Reset form
    setShowNewThreadForm(false)
    setNewThread({ title: '', content: '', tags: [], classId: '' })
    setError(null)
  }

  const handleReply = (threadId: string, content: string, parentReplyId?: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return

    const newReply = {
      id: `r${thread.replies.length + 1}`,
      threadId,
      parentReplyId,
      content,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: []
    }

    const updatedThread = {
      ...thread,
      replies: [...thread.replies, newReply]
    }
    setThreads(threads.map(t => t.id === threadId ? updatedThread : t))
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Classes</h2>
        </div>
        <div className="space-y-1 p-2">
          <button
            onClick={() => setSelectedClass(null)}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
              !selectedClass ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            All Classes
          </button>
          {userClasses.map(classItem => (
            <button
              key={classItem.id}
              onClick={() => setSelectedClass(classItem.id)}
              className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                selectedClass === classItem.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              {classItem.name}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Tags</h2>
          <div className="space-y-2">
            {Object.values(ForumTagCategory).map(tag => (
              <label key={tag} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTags([...selectedTags, tag])
                    } else {
                      setSelectedTags(selectedTags.filter(t => t !== tag))
                    }
                  }}
                  className="rounded text-blue-600"
                />
                <span>{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedClass
                ? `Discussions - ${userClasses.find(c => c.id === selectedClass)?.name}`
                : 'All Discussions'}
            </h1>
            <button
              onClick={() => setShowNewThreadForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Discussion
            </button>
          </div>

          {showNewThreadForm && (
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Create New Discussion</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreateThread}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Class
                    </label>
                    <select
                      value={newThread.classId}
                      onChange={(e) => setNewThread({ ...newThread, classId: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a class</option>
                      {userClasses.map(classItem => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <textarea
                      value={newThread.content}
                      onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(ForumTagCategory).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const hasTag = newThread.tags.includes(tag)
                            setNewThread({
                              ...newThread,
                              tags: hasTag
                                ? newThread.tags.filter(t => t !== tag)
                                : [...newThread.tags, tag]
                            })
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            newThread.tags.includes(tag)
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewThreadForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Discussion
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-6">
            {filteredThreads.map(thread => (
              <ForumThread
                key={thread.id}
                thread={thread}
                onReply={(content, parentReplyId) => handleReply(thread.id, content, parentReplyId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
