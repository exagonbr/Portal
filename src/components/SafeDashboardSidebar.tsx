'use client'

import { Suspense, lazy } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

// Fallback component minimalista
const SidebarFallback = () => {
  const { theme } = useTheme() || { theme: null }
  
  return (
    <div 
      className="w-64 flex flex-col h-screen shadow-xl border-r"
      style={{
        backgroundColor: theme?.colors?.sidebar?.bg || '#1e3a8a',
        borderColor: theme?.colors?.sidebar?.border || '#3b82f6',
        color: theme?.colors?.sidebar?.text || '#e0e7ff'
      }}
    >
      {/* Logo */}
      <div className="border-b p-4 h-20 flex items-center justify-center">
        <div className="text-white font-bold text-lg">Portal Educacional</div>
      </div>
      
      {/* Basic navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <a 
            href="/dashboard" 
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </a>
          <a 
            href="/chat" 
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            <span className="text-sm">Mensagens</span>
          </a>
        </nav>
      </div>
    </div>
  )
}

// Loading component minimalista
const SidebarLoading = () => {
  return null; // Não mostrar loading
}

// Lazy load the DashboardSidebar com fallback silencioso
const LazyDashboardSidebar = lazy(() => 
  import('./dashboard/DashboardSidebar')
    .catch((error) => {
      console.log('Erro ao carregar DashboardSidebar:', error)
      // Return fallback silencioso
      return {
        default: () => <SidebarFallback />
      }
    })
)

export default function SafeDashboardSidebar() {
  return (
    <Suspense fallback={<SidebarLoading />}>
      <LazyDashboardSidebar />
    </Suspense>
  )
} 