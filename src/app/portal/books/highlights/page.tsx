'use client';

import React, { useMemo } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { mockBooks } from '@/constants/mockData';

interface Highlight {
    id: number;
    page: number;
    text: string;
    color: string;
    date: string;
}

interface HighlightsMap {
    [bookId: string]: Highlight[];
}

// Mock highlights data (in real app, this would come from an API/database)
const mockHighlights: HighlightsMap = {
    'book-1': [
        { id: 1, page: 15, text: 'A metodologia científica requer um processo sistemático de investigação...', color: 'yellow', date: '2024-01-15' },
        { id: 2, page: 28, text: 'Os resultados demonstram uma correlação significativa entre...', color: 'green', date: '2024-01-16' }
    ],
    'book-2': [
        { id: 3, page: 42, text: 'Os princípios fundamentais da teoria podem ser resumidos em...', color: 'blue', date: '2024-01-14' }
    ]
};

interface BookWithHighlights {
    id: string;
    thumbnail: string;
    title: string;
    author: string;
    highlights: Highlight[];
}

const colorClasses = {
    yellow: 'bg-yellow-100 border-yellow-400',
    green: 'bg-green-100 border-green-400',
    blue: 'bg-blue-100 border-blue-400'
};

export default function HighlightsPage() {
    const booksWithHighlights = useMemo(() => {
        return mockBooks
            .filter(book => mockHighlights[book.id])
            .map(book => ({
                ...book,
                highlights: mockHighlights[book.id]
            }));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Meus Destaques</h1>

                {/* Books with Highlights List */}
                <div className="space-y-6">
                    {booksWithHighlights.map(book => (
                        <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Book Header */}
                            <div className="flex items-center gap-4 p-4 border-b border-gray-200">
                                <img
                                    src={book.thumbnail}
                                    alt={book.title}
                                    className="w-16 h-20 object-cover rounded"
                                />
                                <div>
                                    <h3 className="font-semibold">{book.title}</h3>
                                    <p className="text-sm text-gray-600">{book.author}</p>
                                    <p className="text-sm text-gray-500">
                                        {book.highlights.length} destaque(s)
                                    </p>
                                </div>
                            </div>

                            {/* Highlights List */}
                            <div className="divide-y divide-gray-100">
                                {book.highlights.map(highlight => (
                                    <div key={highlight.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start gap-3">
                                            <StarIcon className="w-5 h-5 text-yellow-500 mt-1" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Página {highlight.page}
                          </span>
                                                    <span className="text-xs text-gray-500">
                            {new Date(highlight.date).toLocaleDateString('pt-BR')}
                          </span>
                                                </div>
                                                <blockquote
                                                    className={`p-3 border-l-4 rounded-r-lg ${colorClasses[highlight.color as keyof typeof colorClasses]}`}
                                                >
                                                    {highlight.text}
                                                </blockquote>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {booksWithHighlights.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                            <StarIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">
                            Você ainda não tem destaques.
                            <br />
                            Selecione trechos do texto enquanto lê para destacá-los.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
