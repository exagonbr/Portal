'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SimpleCarousel from "@/components/SimpleCarousel";
import BookCard from '../../../components/BookCard';
import { mockBooks, carouselBookImages } from '@/constants/mockData';

interface Filters {
  name: string;
  progress: string;
  orderBy: string;
  discipline: string;
  author: string;
}

export default function BooksPage() {
  const [filters, setFilters] = useState<Filters>({
    name: '',
    progress: 'all',
    orderBy: 'title',
    discipline: 'all',
    author: 'all'
  });

  // Get unique authors for the filter dropdown
  const authors = useMemo(() => {
    const uniqueAuthors = Array.from(new Set(mockBooks.map(book => book.author)));
    return ['all', ...uniqueAuthors.sort()];
  }, []);

  // Get unique disciplines (using publisher as proxy since we don't have disciplines)
  const disciplines = useMemo(() => {
    const uniqueDisciplines = Array.from(new Set(mockBooks.map(book => book.publisher)));
    return ['all', ...uniqueDisciplines.sort()];
  }, []);

  // Filter and sort books based on current filters
  const filteredBooks = useMemo(() => {
    return mockBooks
      .filter(book => {
        const nameMatch = book.title.toLowerCase().includes(filters.name.toLowerCase()) ||
                        book.author.toLowerCase().includes(filters.name.toLowerCase());
        const progressMatch = filters.progress === 'all' ? true :
          filters.progress === 'in-progress' ? (book.progress && book.progress > 0 && book.progress < 100) :
          filters.progress === 'completed' ? (book.progress === 100) :
          filters.progress === 'not-started' ? (!book.progress) : true;
        const disciplineMatch = filters.discipline === 'all' ? true :
          book.publisher === filters.discipline;
        const authorMatch = filters.author === 'all' ? true :
          book.author === filters.author;

        return nameMatch && progressMatch && disciplineMatch && authorMatch;
      })
      .sort((a, b) => {
        switch (filters.orderBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'author':
            return a.author.localeCompare(b.author);
          case 'progress':
            return (b.progress || 0) - (a.progress || 0);
          default:
            return 0;
        }
      });
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Hero Section */}
      <section className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gradient-to-b from-gray-900 to-gray-800">
        <SimpleCarousel images={carouselBookImages} autoplaySpeed={3000} />
      </section>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 p-4 bg-gray-900 rounded-lg shadow">
          <h2 className="text-xl text-white font-bold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Name Filter */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar por título ou autor"
              />
            </div>

            {/* Progress Filter */}
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-white mb-1">
                Progresso
              </label>
              <select
                id="progress"
                name="progress"
                value={filters.progress}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="not-started">Não Iniciado</option>
                <option value="in-progress">Em Progresso</option>
                <option value="completed">Concluído</option>
              </select>
            </div>

            {/* Order By Filter */}
            <div>
              <label htmlFor="orderBy" className="block text-sm font-medium text-white mb-1">
                Ordenar Por
              </label>
              <select
                id="orderBy"
                name="orderBy"
                value={filters.orderBy}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="title">Título</option>
                <option value="author">Autor</option>
                <option value="progress">Progresso</option>
              </select>
            </div>

            {/* Discipline Filter */}
            <div>
              <label htmlFor="discipline" className="block text-sm font-medium text-white mb-1">
                Disciplina
              </label>
              <select
                id="discipline"
                name="discipline"
                value={filters.discipline}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {disciplines.map(discipline => (
                  <option key={discipline} value={discipline}>
                    {discipline === 'all' ? 'Todas' : discipline}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Filter */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-white mb-1">
                Autor
              </label>
              <select
                id="author"
                name="author"
                value={filters.author}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {authors.map(author => (
                  <option key={author} value={author}>
                    {author === 'all' ? 'Todos' : author}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="h-full">
              <BookCard
                id={book.id}
                thumbnail={book.thumbnail}
                title={book.title}
                author={book.author}
                publisher={book.publisher}
                synopsis={book.synopsis}
                duration={book.duration}
                progress={book.progress}
                format={book.format}
              />
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum livro encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
