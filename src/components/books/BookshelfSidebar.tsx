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
  { name: 'TI', href: '/portal/books/category/it' },
];

export default function BookshelfSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import clicked');
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar em minha biblioteca"
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

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
                    : 'text-gray-300 hover:bg-gray-700'
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
          <div className="px-4 py-2 text-sm font-semibold text-gray-400 uppercase">
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
                      : 'text-gray-300 hover:bg-gray-700'
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

      {/* Import Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleImport}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          <span>Importar</span>
        </button>
      </div>
    </div>
  );
}
