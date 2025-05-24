'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Navigation } from './Navigation'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md transition-all duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center relative">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-[100px] h-[40px] relative">
              <Image
                src="/sabercon-logo.png"
                alt="Logo"
                fill
                priority
                sizes="100px"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </Link>
          
          <Navigation />
        </div>
      </div>
    </header>
  )
}
