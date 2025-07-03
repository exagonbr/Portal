'use client';

import { BookOpenIcon, HeartIcon, PencilSquareIcon, StarIcon, BookmarkIcon, MagnifyingGlassIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarItem {
  name: string;
  icon: React.ElementType;
  activeIcon?: React.ElementType;
  href: string;
}

interface BookshelfCategory {
  name: string;
  href: string;
}

const mainItems: SidebarItem[] = [
  { name: 'Livros', icon: BookOpenIcon, href: '/portal/books' },
  { name: 'Favoritos', icon: HeartIcon, activeIcon: HeartSolidIcon, href: '/portal/books/favorites' },
  { name: 'Anotações', icon: PencilSquareIcon, href: '/portal/books/annotations' },
  { name: 'Destaques', icon: StarIcon, activeIcon: StarSolidIcon, href: '/portal/books/highlights' },
];

const bookshelfCategories: BookshelfCategory[] = [
  { name: 'Estudo', href: '/portal/books/category/study' },
  { name: 'Trabalho', href: '/portal/books/category/work' },
  { name: 'Entretenimento', href: '/portal/books/category/entertainment' },
];

export default function BookSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-64 h-screen  text-white flex flex-col">
      <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
        {/* Main Items */}
        <div className="space-y-2">
          {mainItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-black hover:bg-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Bookshelf Categories */}
        <div>
          <div className="px-4 py-2 text-sm font-semibold text-black uppercase">
            Estante
          </div>
          <div className="mt-2 space-y-1">
            {bookshelfCategories.map((category) => {
              const isActive = pathname === category.href;
              
              return (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-black hover:bg-gray-300'
                  }`}
                >
                  <BookmarkIcon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
