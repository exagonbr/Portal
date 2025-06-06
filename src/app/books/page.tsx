'use client';

import React, { useState, useEffect } from 'react';
import BookList from '@/components/books/BookList';
import { Book, mockBookList } from '../../constants/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';;
import { Search, BookOpen, FileText } from 'lucide-react';

export default function BooksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(mockBookList);
  
  // Filtrar livros com base na busca e na aba ativa
  useEffect(() => {
    let result = mockBookList;
    
    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(term) || 
        (book.author && book.author.toLowerCase().includes(term))
      );
    }
    
    // Filtrar por tipo de arquivo
    if (activeTab !== 'all') {
      result = result.filter(book => book.format.toLowerCase() === activeTab);
    }
    
    setFilteredBooks(result);
  }, [searchTerm, activeTab]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Biblioteca Digital</h1>
      </div>
      
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar por título ou autor..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="epub" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              EPUB
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <BookList books={filteredBooks} showViewer={false} />
          </TabsContent>
          
          <TabsContent value="pdf">
            <BookList books={filteredBooks} showViewer={false} />
          </TabsContent>
          
          <TabsContent value="epub">
            <BookList books={filteredBooks} showViewer={false} />
          </TabsContent>
        </Tabs>
      </div>
      
      {filteredBooks.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            Nenhum livro encontrado
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tente ajustar os filtros ou termos de busca.
          </p>
        </div>
      )}
    </div>
  );
} 