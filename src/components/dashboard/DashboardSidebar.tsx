'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  href: string
  icon: string
  label: string
}

interface NavSection {
  section: string
  items: NavItem[]
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      // Wait for logout to complete before redirecting
      await logout()
      // Force a page refresh to clear any cached states
      window.location.href = '/login'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const getNavItems = (): NavSection[] => {
    const commonItems: NavSection[] = [
      {
        section: 'Principal',
        items: [
          { href: `/dashboard/${user?.type || ''}`, icon: 'dashboard', label: 'Dashboard' },
          { href: '/courses', icon: 'school', label: 'Meus Cursos' },
          { href: '/assignments', icon: 'assignment', label: 'Minhhas Atividades' },
          { href: '/live', icon: 'video_camera_front', label: 'Aulas ao Vivo' },
          { href: '/chat', icon: 'chat', label: 'Chat' },
          { href: '/lessons', icon: 'school', label: 'Minhas Aulas' },
        ]
      },
      {
        section: 'Biblioteca',
        items: [
          { href: `/dashboard/${user?.type || ''}`, icon: 'school', label: 'Acessar Livros' },
        ]
      },
      {
        section: 'Portal Aluno',
        items: [
          { href: `/dashboard/${user?.type || ''}`, icon: 'dashboard', label: 'Acessar Material' },

        ]
      }
    ]

    if (user?.type === 'student') {
      commonItems.push({
        section: 'Comunicação',
        items: [
          {href: '/chat', icon: 'chat', label: 'Chat'}
        ]
      })
    }

    if (user?.type === 'teacher') {
      commonItems.push({
        section: 'Gestão',
        items: [
          {href: '/students', icon: 'group', label: 'Alunos'},
          {href: '/grades', icon: 'grade', label: 'Notas'}
        ]
      }, {
        section: 'Portal de Videos',
        items: [
          {href: `/dashboard/${user?.type || ''}`, icon: 'dashboard', label: 'Dashboard'},
          {href: `/dashboard/${user?.type || ''}`, icon: 'school', label: 'Acessar Videos'},
        ]
      }, {
        section: 'Biblioteca',
        items: [
          {href: `/dashboard/${user?.type || ''}`, icon: 'dashboard', label: 'Dashboard'},
          {href: `/dashboard/${user?.type || ''}`, icon: 'school', label: 'Acessar Livros'},
        ]
      }, {
        section: 'Portal Aluno',
        items: [
          {href: `/dashboard/${user?.type || ''}`, icon: 'dashboard', label: 'Dashboard'},
          {href: '/lessons', icon: 'school', label: 'Acessar Conteúdo'},
        ]
      })
    }

    return commonItems
  }

  return (
      <aside className="w-64 bg-[#0A1628] text-white flex flex-col min-h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center justify-center">
            <div className="relative w-32 h-8">
              <Image
                  src="/sabercon-logo-white.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
              />
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500">person</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-400">
                {user?.role === 'student' ? 'Estudante' : 'Professor'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {getNavItems().map((section, idx) => (
              <div key={idx} className="mb-6">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.section}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                      <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                              pathname === item.href
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-400 hover:bg-blue-600/10 hover:text-white'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                  ))}
                </div>
              </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10">
          <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:animate-pulse">logout</span>
            <span className="text-sm font-medium">Sair da Plataforma</span>
          </button>
        </div>
      </aside>
  )
}
