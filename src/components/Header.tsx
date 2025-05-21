'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-primary shadow-md border-b border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="https://www.sabercon.com.br/wp-content/uploads/2023/12/cropped-logo-sabercon-branco.png"
                  alt="Logo Sabercon"
                  width={140}
                  height={45}
                  className="w-auto h-9"
                  priority
                />
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="border-transparent text-secondary hover:border-accent hover:text-accent inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                Painel
              </Link>
              <Link
                href="/lessons"
                className="border-transparent text-secondary hover:border-accent hover:text-accent inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                Aulas
              </Link>
              <Link
                href="/live"
                className="border-transparent text-secondary hover:border-accent hover:text-accent inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                Aulas Ao Vivo
              </Link>
              <Link
                href="/chat"
                className="border-transparent text-secondary hover:border-accent hover:text-accent inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
              >
                Chat
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-accent hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1 bg-primary border-t border-gray-800">
            <Link
              href="/dashboard"
              className="bg-primary border-transparent text-secondary hover:bg-gray-900 hover:border-accent hover:text-accent block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
            >
              Painel
            </Link>
            <Link
              href="/lessons"
              className="bg-primary border-transparent text-secondary hover:bg-gray-900 hover:border-accent hover:text-accent block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
            >
              Aulas
            </Link>
            <Link
              href="/live"
              className="bg-primary border-transparent text-secondary hover:bg-gray-900 hover:border-accent hover:text-accent block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
            >
              Aulas Ao Vivo
            </Link>
            <Link
              href="/chat"
              className="bg-primary border-transparent text-secondary hover:bg-gray-900 hover:border-accent hover:text-accent block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
            >
              Chat
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
