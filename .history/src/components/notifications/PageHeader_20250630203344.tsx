'use client'

import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  subtitle: string
  backUrl?: string
}

export default function PageHeader({ title, subtitle, backUrl = '/notifications' }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <button
          onClick={() => router.push(backUrl)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Voltar
        </button>
      </div>
    </div>
  )
}