'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Navigation } from './Navigation'

export function Header() {
  return (
    <header className="header-shadow sticky top-0 z-50 bg-white transition-colors">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center relative">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/sabercon-logo.png"
              alt="Logo"
              width={100}
              height={40}
              priority
              className="w-10 h-10"
            />
            <span className="font-semibold text-xl hidden sm:inline-block">
              Portal Educacional
            </span>
          </Link>
          
          <Navigation />
        </div>
      </div>
    </header>
  )
}
