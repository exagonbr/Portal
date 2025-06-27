'use client'

import { UserRole } from '@/types/roles'

export interface AdminMenuItem {
  href: string
  icon: string
  label: string
  permission?: keyof import('@/types/roles').RolePermissions
}

export interface AdminMenuSection {
  section: string
  items: AdminMenuItem[]
}

export const getSystemAdminMenuItems = (): AdminMenuSection[] => {
  try {
    const menu = [
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
          href: '/admin/content/search',
          icon: 'archive',
          label: 'Gerenciar Arquivos',
          permission: 'canManageSystem'
        },
        {
          href: '/portal/collections',
          icon: 'video_library',
          label: 'Visualizar Coleções',
          permission: 'canManageSystem'
        },
        {
          href: '/portal/collections/manage',
          icon: 'edit_note',
          label: 'Gerenciar Coleções',
          permission: 'canManageSystem'
        },
        {
          href: '/portal/collections/admin',
          icon: 'admin_panel_settings',
          label: 'Admin de Coleções',
          permission: 'canManageSystem'
        }
      ]
    },
    {
      section: 'Migração de Dados',
      items: [
        {
          href: '/admin/migration/mysql-postgres',
          icon: 'sync_alt',
          label: 'Migração MySQL → PostgreSQL',
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
  ];
  
  // Debug temporário
  console.log('🔍 Menu gerado pelo getSystemAdminMenuItems:', menu);
  const gestaoConteudo = menu.find(section => section.section === 'Gestão de Conteúdo');
  console.log('🔍 Seção Gestão de Conteúdo:', gestaoConteudo);
  if (gestaoConteudo) {
    console.log('🔍 Itens na seção:', gestaoConteudo.items);
    const adminItem = gestaoConteudo.items.find(item => item.href === '/portal/collections/admin');
    console.log('🔍 Item admin encontrado:', adminItem);
  }
  
  return menu;
  } catch (error) {
    console.error('Erro ao gerar menu do System Admin:', error);
    return [
      {
        section: 'Principal',
        items: [
          {
            href: '/dashboard/system-admin',
            icon: 'dashboard',
            label: 'Painel Principal'
          }
        ]
      }
    ];
  }
} 