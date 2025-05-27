import { Annotation } from '@/components/books/BookViewer/types';

interface AnnotationsMap {
    [bookId: string]: Annotation[];
}

export const mockAnnotations: AnnotationsMap = {
    'test-book-1': [
        {
            id: 'ann-1',
            pageNumber: 15,
            content: 'Importante conceito sobre metodologia científica que precisa ser revisado.',
            position: { x: 150, y: 200 },
            createdAt: '2024-01-15T10:30:00Z'
        },
        {
            id: 'ann-2',
            pageNumber: 28,
            content: 'Definição fundamental para o entendimento do capítulo.',
            position: { x: 180, y: 350 },
            createdAt: '2024-01-16T14:20:00Z'
        }
    ],
    'test-book-2': [
        {
            id: 'ann-3',
            pageNumber: 42,
            content: 'Referência importante para a bibliografia.',
            position: { x: 200, y: 150 },
            createdAt: '2024-01-14T09:15:00Z'
        }
    ],
    'test-book-3': [
        {
            id: 'ann-4',
            pageNumber: 67,
            content: 'Exemplo prático de aplicação da teoria.',
            position: { x: 250, y: 400 },
            createdAt: '2024-01-17T16:45:00Z'
        },
        {
            id: 'ann-5',
            pageNumber: 89,
            content: 'Conclusão relevante para o trabalho final.',
            position: { x: 300, y: 280 },
            createdAt: '2024-01-18T11:30:00Z'
        }
    ]
};
