import React from 'react'
import { LucideIcon } from 'lucide-react'

// Não precisamos importar o CSS diretamente, pois já está sendo importado no globals.css
// import '@/styles/cards-standard.css'

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  subtitle: string
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'cyan' | 'emerald' | 'violet'
  trend?: string
  className?: string
  onClick?: () => void
}

interface ContentCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  icon?: LucideIcon
  iconColor?: string
  status?: 'active' | 'inactive'
  className?: string
  onClick?: () => void
  actions?: React.ReactNode
}

// Card de Estatísticas Premium
export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = 'blue',
  trend,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`stat-card stat-card-${color} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Efeito de brilho animado */}
      <div className="stat-card-shine"></div>
      
      {/* Partículas de fundo */}
      <div className="stat-card-particles">
        <div className="stat-card-particle-1"></div>
        <div className="stat-card-particle-2"></div>
        <div className="stat-card-particle-3"></div>
        <div className="stat-card-particle-4"></div>
      </div>

      <div className="stat-card-content">
        <div className="flex items-center justify-between mb-4">
          <div className="stat-card-icon-wrapper">
            <Icon className="stat-card-icon" />
          </div>
          <div className="text-right">
            <p className="stat-card-value">{value}</p>
            {trend && (
              <div className="flex items-center justify-end gap-2 mt-2">
                <div className="stat-card-indicator"></div>
                <span className="stat-card-label">{trend}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <h3 className="stat-card-title">{title}</h3>
          <p className="stat-card-subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

// Card de Conteúdo Moderno
export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  children,
  icon: Icon,
  iconColor = 'bg-blue-500',
  status,
  className = '',
  onClick,
  actions
}) => {
  return (
    <div 
      className={`content-card ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="content-card-header">
        <div className="content-card-header-gradient">
          {/* Partículas de fundo */}
          <div className="content-card-header-particles">
            <div className="content-card-header-particle-1"></div>
            <div className="content-card-header-particle-2"></div>
            <div className="content-card-header-particle-3"></div>
            <div className="content-card-header-particle-4"></div>
          </div>

          <div className="content-card-header-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className={`content-card-icon-wrapper ${iconColor}`}>
                    <Icon className="content-card-icon" />
                  </div>
                )}
                <div>
                  <h3 className="content-card-title">{title}</h3>
                  {subtitle && <p className="content-card-subtitle">{subtitle}</p>}
                </div>
              </div>
              {status && (
                <div className={`status-badge ${status === 'active' ? 'status-badge-active' : 'status-badge-inactive'}`}>
                  {status === 'active' ? 'Ativo' : 'Inativo'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="content-card-body">
        {children}
      </div>

      {actions && (
        <div className="content-card-footer">
          {actions}
        </div>
      )}
    </div>
  )
}

// Card Simples (para casos mais básicos)
interface SimpleCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export const SimpleCard: React.FC<SimpleCardProps> = ({
  children,
  className = '',
  onClick,
  hover = true
}) => {
  const hoverClasses = hover ? 'hover:shadow-sm hover:-translate-y-0.5' : ''
  
  return (
    <div 
      className={`bg-white rounded-md shadow-sm border border-gray-100 p-2 transition-all duration-200 ${hoverClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default { StatCard, ContentCard, SimpleCard } 