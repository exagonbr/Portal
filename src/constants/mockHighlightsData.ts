import { Highlight } from '@/components/books/BookViewer/types';

interface HighlightsMap {
    [bookId: string]: Highlight[];
}

export const mockHighlights: HighlightsMap = {
    'test-book-1': [
        {
            id: 'hl-1',
            pageNumber: 15,
            content: 'A metodologia científica requer um processo sistemático de investigação e documentação dos resultados obtidos.',
            color: '#FFEB3B', // yellow
            position: { x: 150, y: 200, width: 400, height: 24 },
            createdAt: '2024-01-15T10:30:00Z'
        },
        {
            id: 'hl-2',
            pageNumber: 28,
            content: 'Os resultados demonstram uma correlação significativa entre as variáveis estudadas, sugerindo uma forte relação causal.',
            color: '#4CAF50', // green
            position: { x: 180, y: 350, width: 380, height: 48 },
            createdAt: '2024-01-16T14:20:00Z'
        }
    ],
    'test-book-2': [
        {
            id: 'hl-3',
            pageNumber: 42,
            content: 'Os princípios fundamentais da teoria podem ser resumidos em três aspectos principais que se interrelacionam.',
            color: '#2196F3', // blue
            position: { x: 200, y: 150, width: 420, height: 24 },
            createdAt: '2024-01-14T09:15:00Z'
        }
    ],
    'test-book-3': [
        {
            id: 'hl-4',
            pageNumber: 67,
            content: 'A aplicação prática destes conceitos demonstra a versatilidade da metodologia em diferentes contextos.',
            color: '#FFEB3B', // yellow
            position: { x: 250, y: 400, width: 390, height: 24 },
            createdAt: '2024-01-17T16:45:00Z'
        }
    ]
};

// Color mapping for UI display
export const highlightColorClasses = {
    '#FFEB3B': 'bg-yellow-100 border-yellow-400',
    '#4CAF50': 'bg-green-100 border-green-400',
    '#2196F3': 'bg-blue-100 border-blue-400'
};
