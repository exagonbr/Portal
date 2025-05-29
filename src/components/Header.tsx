'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Navigation } from './Navigation'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background-primary shadow-md transition-all duration-200">
      <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center relative">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-[80px] sm:w-[90px] md:w-[100px] h-[32px] sm:h-[36px] md:h-[40px] relative">
              <Image
                src="/sabercon-logo.png"
                alt="Logo"
                fill
                priority
                sizes="(max-width: 640px) 80px, (max-width: 768px) 90px, 100px"
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
