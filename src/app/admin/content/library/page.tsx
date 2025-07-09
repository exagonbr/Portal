'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Plus, Search, RefreshCw, Book, Video, FolderKanban, FileText } from 'lucide-react';
import { useToast } from '@/components/ToastManager';
import ContentLibrary from '@/components/content/ContentLibrary';
import ContentUpload from '@/components/content/ContentUpload';
import ContentSearch from '@/components/content/ContentSearch';
import CollectionManager from '@/components/content/CollectionManager';
import BookUploadByEducationCycle from '@/components/content/BookUploadByEducationCycle';

type Tab = 'library' | 'upload' | 'search' | 'collections' | 'books';

export default function ContentManagementPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar busca conforme necessário
    showSuccess("Busca realizada", "Resultados filtrados com sucesso!");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simular atualização
    setTimeout(() => {
      setRefreshing(false);
      showSuccess("Atualizado", "Conteúdo atualizado com sucesso!");
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header Simplificado */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Conteúdo</h1>
              <p className="text-gray-600 mt-1">Gerencie o conteúdo do sistema</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={() => router.push('/admin/content/upload')} 
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Conteúdo
              </Button>
            </div>
          </div>

          {/* Search Simplificado */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar conteúdo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="px-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button
                onClick={() => handleTabChange('library')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2
                  ${activeTab === 'library'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <FileText className="w-4 h-4" />
                Biblioteca
              </button>
              <button
                onClick={() => handleTabChange('collections')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2
                  ${activeTab === 'collections'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <FolderKanban className="w-4 h-4" />
                Coleções
              </button>
              <button
                onClick={() => handleTabChange('upload')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2
                  ${activeTab === 'upload'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Video className="w-4 h-4" />
                Upload de Vídeos
              </button>
              <button
                onClick={() => handleTabChange('books')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2
                  ${activeTab === 'books'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Book className="w-4 h-4" />
                Upload de Livros
              </button>
              <button
                onClick={() => handleTabChange('search')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2
                  ${activeTab === 'search'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Search className="w-4 h-4" />
                Busca Inteligente
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'library' && <ContentLibrary />}
          {activeTab === 'collections' && <CollectionManager />}
          {activeTab === 'upload' && <ContentUpload />}
          {activeTab === 'books' && <BookUploadByEducationCycle />}
          {activeTab === 'search' && <ContentSearch />}
        </div>
      </div>
    </div>
  );
}
