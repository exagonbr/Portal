'use client'

import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-100 h-16">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Title */}
        <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
        
        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <button className="p-2 hover:bg-gray-50 rounded-full relative">
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </button>

          {/* Profile Section */}
          <div className="flex items-center space-x-3">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#1a2b6d] flex items-center justify-center overflow-hidden">
                <div className="relative w-6 h-6">
                  <Image 
                    src="/sabercon-logo-white.png"
                    alt="Profile"
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            {/* Profile Info */}
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.role === 'student' ? 'Estudante' : 'Professor'}
                </span>
              </div>
              <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
