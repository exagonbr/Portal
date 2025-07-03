'use client';

import React, { useMemo } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { mockBooks, mockAnnotations } from '@/constants/mockData';
import { Annotation } from '@/components/books/BookViewer/types';

interface BookWithAnnotations {
    id: string;
    thumbnail: string;
    title: string;
    author: string;
    annotations: Annotation[];
}

export default function AnnotationsPage() {
    const booksWithAnnotations = useMemo(() => {
        return mockBooks
            .filter(book => mockAnnotations[book.id])
            .map(book => ({
                ...book,
                annotations: mockAnnotations[book.id]
            }));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Minhas Anotações</h1>

                {/* Books with Annotations List */}
                <div className="space-y-6">
                    {booksWithAnnotations.map(book => (
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
                                        {book.annotations.length} anotação(ões)
                                    </p>
                                </div>
                            </div>

                            {/* Annotations List */}
                            <div className="divide-y divide-gray-100">
                                {book.annotations.map(annotation => (
                                    <div key={annotation.id} className="p-4 hover:bg-gray-50">
                                        <div className="flex items-start gap-3">
                                            <PencilSquareIcon className="w-5 h-5 text-blue-500 mt-1" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">
                                                        Página {annotation.pageNumber}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(annotation.createdAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                                    <p className="text-gray-700">{annotation.content}</p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Posição: x: {annotation.position.x}, y: {annotation.position.y}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {booksWithAnnotations.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                            <PencilSquareIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">
                            Você ainda não tem anotações.
                            <br />
                            Adicione anotações enquanto lê para fazer observações importantes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
