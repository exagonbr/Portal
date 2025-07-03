'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ForumPost {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    role: 'student' | 'teacher'
  }
  course: string
  courseId: string
  category: 'question' | 'discussion' | 'announcement' | 'help'
  tags: string[]
  createdAt: Date
  updatedAt: Date
  views: number
  replies: number
  lastReply?: {
    author: string
    date: Date
  }
  solved?: boolean
  pinned?: boolean
  likes: number
  userLiked?: boolean
}

export default function StudentForumPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'question' | 'discussion' | 'announcement' | 'help'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent')
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewPostModal, setShowNewPostModal] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      // Simular dados por enquanto
      const mockPosts: ForumPost[] = [
        {
          id: '1',
          title: 'Dúvida sobre equações do segundo grau',
          content: 'Alguém pode me ajudar a entender melhor a fórmula de Bhaskara?',
          author: { id: '1', name: 'João Silva', role: 'student' },
          course: 'Matemática Básica',
          courseId: '1',
          category: 'question',
          tags: ['matemática', 'equações', 'bhaskara'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
          views: 45,
          replies: 3,
          lastReply: {
            author: 'Prof. Carlos',
            date: new Date(Date.now() - 30 * 60 * 1000)
          },
          solved: true,
          pinned: false,
          likes: 5,
          userLiked: false
        },
        {
          id: '2',
          title: 'Discussão: Importância da literatura na formação',
          content: 'Vamos discutir como a literatura influencia nossa formação pessoal e acadêmica.',
          author: { id: '2', name: 'Prof. Maria Santos', role: 'teacher' },
          course: 'Português - Gramática',
          courseId: '2',
          category: 'discussion',
          tags: ['literatura', 'português', 'debate'],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          views: 128,
          replies: 15,
          lastReply: {
            author: 'Ana Costa',
            date: new Date(Date.now() - 5 * 60 * 60 * 1000)
          },
          pinned: true,
          likes: 23,
          userLiked: true
        },
        {
          id: '3',
          title: 'Aviso: Prova de História adiada',
          content: 'A prova prevista para sexta-feira foi adiada para a próxima semana.',
          author: { id: '3', name: 'Prof. Carlos Oliveira', role: 'teacher' },
          course: 'História do Brasil',
          courseId: '3',
          category: 'announcement',
          tags: ['aviso', 'prova', 'história'],
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          views: 89,
          replies: 2,
          pinned: true,
          likes: 12,
          userLiked: false
        },
        {
          id: '4',
          title: 'Ajuda com trabalho de Ciências',
          content: 'Preciso de ajuda para entender o conceito de fotossíntese para o trabalho.',
          author: { id: '4', name: 'Pedro Santos', role: 'student' },
          course: 'Ciências Naturais',
          courseId: '4',
          category: 'help',
          tags: ['ciências', 'fotossíntese', 'trabalho'],
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          views: 23,
          replies: 0,
          solved: false,
          pinned: false,
          likes: 1,
          userLiked: false
        }
      ]
      
      setPosts(mockPosts)
      setLoading(false)
    } catch (error) {
      console.log('Erro ao buscar posts:', error)
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.category === filter
    const matchesCourse = selectedCourse === 'all' || post.courseId === selectedCourse
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesFilter && matchesCourse && matchesSearch
  }).sort((a, b) => {
    // Pinned posts sempre primeiro
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    
    switch (sortBy) {
      case 'recent':
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      case 'popular':
        return b.views - a.views
      case 'unanswered':
        if (a.replies === 0 && b.replies > 0) return -1
        if (a.replies > 0 && b.replies === 0) return 1
        return b.createdAt.getTime() - a.createdAt.getTime()
      default:
        return 0
    }
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'question': return 'help'
      case 'discussion': return 'forum'
      case 'announcement': return 'campaign'
      case 'help': return 'support'
      default: return 'chat'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'question': return theme.colors.status.info
      case 'discussion': return theme.colors.primary.DEFAULT
      case 'announcement': return theme.colors.status.warning
      case 'help': return theme.colors.status.error
      default: return theme.colors.text.secondary
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'question': return 'Pergunta'
      case 'discussion': return 'Discussão'
      case 'announcement': return 'Aviso'
      case 'help': return 'Ajuda'
      default: return category
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.userLiked ? post.likes - 1 : post.likes + 1,
          userLiked: !post.userLiked
        }
      }
      return post
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: theme.colors.primary.DEFAULT }}></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
              Fórum de Discussão
            </h1>
            <p style={{ color: theme.colors.text.secondary }}>
              Tire dúvidas, participe de discussões e ajude seus colegas
            </p>
          </div>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              color: 'white'
            }}
          >
            <span className="material-symbols-outlined text-xl">
              add
            </span>
            Nova Postagem
          </button>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-4"
      >
        {/* Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: theme.colors.text.secondary }}>
                search
              </span>
              <input
                type="text"
                placeholder="Buscar posts, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
                style={{
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.DEFAULT,
                  color: theme.colors.text.primary
                }}
              />
            </div>
          </div>

          {/* Filtro por Curso */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: theme.colors.background.card,
              borderColor: theme.colors.border.DEFAULT,
              color: theme.colors.text.primary
            }}
          >
            <option value="all">Todos os Cursos</option>
            <option value="1">Matemática Básica</option>
            <option value="2">Português - Gramática</option>
            <option value="3">História do Brasil</option>
            <option value="4">Ciências Naturais</option>
          </select>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg border"
            style={{
              backgroundColor: theme.colors.background.card,
              borderColor: theme.colors.border.DEFAULT,
              color: theme.colors.text.primary
            }}
          >
            <option value="recent">Mais Recentes</option>
            <option value="popular">Mais Populares</option>
            <option value="unanswered">Sem Resposta</option>
          </select>
        </div>

        {/* Filtros por Categoria */}
        <div className="flex gap-2">
          {(['all', 'question', 'discussion', 'announcement', 'help'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === category ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: filter === category ? theme.colors.primary.DEFAULT : theme.colors.background.card,
                color: filter === category ? 'white' : theme.colors.text.secondary,
                borderWidth: '1px',
                borderColor: filter === category ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT
              }}
            >
              {category === 'all' ? 'Todos' : getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Lista de Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
            style={{
              backgroundColor: theme.colors.background.card,
              borderWidth: '1px',
              borderColor: post.pinned ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT
            }}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Ícone da Categoria */}
                <div className="p-2 rounded-lg flex-shrink-0"
                     style={{ backgroundColor: getCategoryColor(post.category) + '20' }}>
                  <span className="material-symbols-outlined text-xl"
                        style={{ color: getCategoryColor(post.category) }}>
                    {getCategoryIcon(post.category)}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {post.pinned && (
                          <span className="material-symbols-outlined text-base"
                                style={{ color: theme.colors.primary.DEFAULT }}>
                            push_pin
                          </span>
                        )}
                        {post.solved && (
                          <span className="material-symbols-outlined text-base"
                                style={{ color: theme.colors.status.success }}>
                            check_circle
                          </span>
                        )}
                        <Link
                          href={`/student/forum/${post.id}`}
                          className="text-lg font-semibold hover:underline"
                          style={{ color: theme.colors.text.primary }}
                        >
                          {post.title}
                        </Link>
                      </div>
                      <p className="text-sm mb-2" style={{ color: theme.colors.text.secondary }}>
                        {post.content}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
                          style={{
                            backgroundColor: getCategoryColor(post.category) + '20',
                            color: getCategoryColor(post.category)
                          }}>
                      {getCategoryLabel(post.category)}
                    </span>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80"
                          style={{
                            backgroundColor: theme.colors.background.secondary,
                            color: theme.colors.text.secondary
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Informações e Ações */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm" style={{ color: theme.colors.text.tertiary }}>
                      <span>
                        {post.author.name} • {post.course}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">visibility</span>
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">chat_bubble</span>
                        {post.replies}
                      </span>
                      {post.lastReply && (
                        <span>
                          Última resposta: {post.lastReply.author} {formatDate(post.lastReply.date)}
                        </span>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                          post.userLiked ? 'font-medium' : ''
                        }`}
                        style={{
                          backgroundColor: post.userLiked ? theme.colors.primary.light + '20' : theme.colors.background.secondary,
                          color: post.userLiked ? theme.colors.primary.DEFAULT : theme.colors.text.secondary
                        }}
                      >
                        <span className="material-symbols-outlined text-base">
                          {post.userLiked ? 'favorite' : 'favorite_border'}
                        </span>
                        {post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="material-symbols-outlined text-6xl mb-4"
                style={{ color: theme.colors.text.tertiary }}>
            forum
          </span>
          <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
            Nenhuma postagem encontrada
          </p>
        </motion.div>
      )}
    </div>
  )
} 