'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/document', icon: '📄', label: 'Document' },
  { href: '/contact', icon: '👥', label: 'Contact' },
  { href: '/prospect', icon: '🎯', label: 'Prospect' },
  { href: '/workflow', icon: '⚙️', label: 'Workflow' },
  { href: '/chat', icon: '💬', label: 'Chat Integration' },
  { href: '/marketing', icon: '📈', label: 'Marketing Automation' },
  { href: '/email', icon: '📧', label: 'Email Integration' },
  { href: '/transaction', icon: '💰', label: 'Transaction' },
  { href: '/maintenance', icon: '🔧', label: 'Maintenance' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#0A1628] text-white flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center">
          <div className="relative w-[140px] h-[40px]">
            <Image
              src="/sabercon-logo-white.png"
              alt="Sabercon Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              pathname === item.href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-blue-600/10 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
