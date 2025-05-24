'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    section: 'Management',
    items: [
      { href: '/dashboard', icon: 'grid_view', label: 'Dashboard' },
      { href: '/document', icon: 'description', label: 'Document' },
      { href: '/contact', icon: 'person_outline', label: 'Contact' },
      { href: '/prospect', icon: 'trending_up', label: 'Prospect' },
      { href: '/workflow', icon: 'settings', label: 'Workflow' },
    ]
  },
  {
    section: 'Connection',
    items: [
      { href: '/chat', icon: 'chat', label: 'Chat Integration' },
      { href: '/marketing', icon: 'campaign', label: 'Marketing Automation' },
      { href: '/email', icon: 'mail_outline', label: 'Email Integration' },
    ]
  },
  {
    section: 'Customer',
    items: [
      { href: '/transaction', icon: 'account_balance_wallet', label: 'Transaction' },
      { href: '/maintenance', icon: 'build', label: 'Maintenance' },
    ]
  }
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#0A1628] text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-semibold text-blue-500">CRM</span>
          <span className="text-xl font-semibold text-white">.io</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        {navItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <div className="px-4 py-2 text-sm text-gray-400 font-medium">
              {section.section}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
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
        ))}
      </nav>
    </aside>
  )
}
