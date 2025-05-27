'use client';

import { useState } from 'react';
import ContentLibrary from '@/components/content/ContentLibrary';
import ContentUpload from '@/components/content/ContentUpload';
import ContentSearch from '@/components/content/ContentSearch';
import CollectionManager from '@/components/content/CollectionManager';
import ModuleManager from '@/components/content/ModuleManager';
import BookUploadByEducationCycle from '@/components/content/BookUploadByEducationCycle';

type Tab = 'library' | 'upload' | 'search' | 'collections' | 'books';

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('library');

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Conteúdo</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('library')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'library'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Biblioteca
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'collections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Coleções
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Upload de Vídeos
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'books'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Upload de Livros
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Busca Inteligente
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'library' && <ContentLibrary />}
        {activeTab === 'collections' && <CollectionManager />}
        {activeTab === 'upload' && <ContentUpload />}
        {activeTab === 'books' && <BookUploadByEducationCycle />}
        {activeTab === 'search' && <ContentSearch />}
      </div>
    </div>
  );
}
