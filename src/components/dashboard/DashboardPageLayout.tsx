'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
interface DashboardPageLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export default function DashboardPageLayout({
  title,
  subtitle,
  children,
  actions
}: DashboardPageLayoutProps) {
  const { theme } = useTheme()

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b"
        style={{ 
          backgroundColor: theme.colors.background.card,
          borderColor: theme.colors.border.light 
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: theme.colors.text.primary }}
              >
                {title}
              </h1>
              {subtitle && (
                <p 
                  className="text-sm mt-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {actions}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
} 