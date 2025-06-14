'use client'

import { UserRole } from '@/types/roles'

export interface AdminMenuItem {
  href: string
  icon: string
  label: string
  permission?: keyof typeof import('@/types/roles').ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]
}

export interface AdminMenuSection {
  section: string
  items: AdminMenuItem[]
}

export const getSystemAdminMenuItems = (): AdminMenuSection[] => {
  return [
    {
      section: 'Principal',
      items: [
        {
          href: '/dashboard/system-admin',
          icon: 'dashboard',
          label: 'Painel Principal'
        },
        {
          href: '/chat',
          icon: 'chat',
          label: 'Mensagens'
        }
      ]
    },
    {
      section: 'Administração do Sistema',
      items: [
        {
          href: '/admin/institutions',
          icon: 'business',
          label: 'Gerenciar Instituições',
          permission: 'canManageInstitutions'
        },
        {
          href: '/admin/schools',
          icon: 'school',
          label: 'Escolas',
          permission: 'canManageSchools'
        },
        {
          href: '/admin/users',
          icon: 'manage_accounts',
          label: 'Usuários Globais',
          permission: 'canManageGlobalUsers'
        },
        {
          href: '/admin/security',
          icon: 'security',
          label: 'Políticas de Segurança',
          permission: 'canManageSecurityPolicies'
        },
        {
          href: '/admin/roles',
          icon: 'key',
          label: 'Gerenciar Permissões',
          permission: 'canManageSystem'
        },
        {
          href: '/admin/settings',
          icon: 'settings',
          label: 'Configurações do Sistema',
          permission: 'canManageSystem'
        }
      ]
    },
    {
      section: 'Comunicação',
      items: [
        {
          href: '/notifications',
          icon: 'notifications',
          label: 'Central de Notificações',
          permission: 'canManageSystem'
        },
        {
          href: '/notifications/send',
          icon: 'send',
          label: 'Enviar Notificação',
          permission: 'canManageSystem'
        },
        {
          href: '/notifications/sent',
          icon: 'history',
          label: 'Histórico de Envios',
          permission: 'canManageSystem'
        }
      ]
    },
    {
      section: 'Gestão de Conteúdo',
      items: [
        {
          href: '/admin/content/library',
          icon: 'library_books',
          label: 'Acervo Digital',
          permission: 'canManageSystem'
        },
        {
          href: '/admin/content/search',
          icon: 'archive',
          label: 'Gerenciar Arquivos',
          permission: 'canManageSystem'
        }
      ]
    },
    {
      section: 'Monitoramento e Análise',
      items: [
        {
          href: '/admin/analytics',
          icon: 'analytics',
          label: 'Analytics do Sistema',
          permission: 'canViewSystemAnalytics'
        },
        {
          href: '/admin/monitoring',
          icon: 'monitor_heart',
          label: 'Monitoramento em Tempo Real',
          permission: 'canManageSystem'
        },
        {
          href: '/admin/logs',
          icon: 'terminal',
          label: 'Logs do Sistema',
          permission: 'canManageSystem'
        },
        {
          href: '/admin/performance',
          icon: 'speed',
          label: 'Performance',
          permission: 'canManageSystem'
        },
        {
          href: '/admin/audit',
          icon: 'history',
          label: 'Logs de Auditoria',
          permission: 'canManageSystem'
        }
      ]
    },
    {
      section: 'Relatórios',
      items: [
        {
          href: '/portal/reports',
          icon: 'assessment',
          label: 'Portal de Relatórios',
          permission: 'canViewPortalReports'
        },
        {
          href: '/admin/reports/system',
          icon: 'summarize',
          label: 'Relatórios do Sistema',
          permission: 'canViewSystemAnalytics'
        },
        {
          href: '/admin/reports/usage',
          icon: 'insights',
          label: 'Relatórios de Uso',
          permission: 'canViewSystemAnalytics'
        }
      ]
    },
    {
      section: 'Manutenção',
      items: [
        {
          href: '/admin/backup',
          icon: 'backup',
          label: 'Backup do Sistema',
          permission: 'canManageSystem'
        },
        {
          href: '/admin/maintenance',
          icon: 'build',
          label: 'Manutenção',
          permission: 'canManageSystem'
        },
        {
          href: '/admin/updates',
          icon: 'system_update',
          label: 'Atualizações',
          permission: 'canManageSystem'
        }
      ]
    }
  ]
} 