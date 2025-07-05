# Sistema de Leitura de Livros

## Visão Geral

O sistema de leitura de livros permite aos usuários acompanhar seu progresso de leitura, criar destaques, adicionar marcadores, fazer anotações e marcar livros como favoritos. Todas as interações são armazenadas no banco de dados e vinculadas ao usuário específico.

## Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `book_progress`
Armazena o progresso de leitura de cada usuário em cada livro.

- **id**: UUID (chave primária)
- **book_id**: Referência ao livro
- **user_id**: Referência ao usuário
- **current_page**: Página atual
- **total_pages**: Total de páginas do livro
- **progress_percent**: Percentual de progresso
- **last_position**: Posição detalhada (JSON)
- **reading_time**: Tempo total de leitura em segundos
- **last_read_at**: Última vez que o livro foi lido
- **completed_at**: Data de conclusão (se aplicável)
- **started_at**: Data de início da leitura
- **created_at**: Data de criação do registro
- **updated_at**: Data da última atualização

#### 2. `book_highlights`
Armazena os destaques/highlights feitos pelos usuários.

- **id**: UUID (chave primária)
- **book_id**: Referência ao livro
- **user_id**: Referência ao usuário
- **page_number**: Número da página
- **start_position**: Posição inicial do destaque
- **end_position**: Posição final do destaque
- **highlighted_text**: Texto destacado
- **color**: Cor do destaque (padrão: #FFFF00)
- **note**: Nota opcional associada
- **created_at**: Data de criação
- **updated_at**: Data da última atualização

#### 3. `book_bookmarks`
Armazena os marcadores criados pelos usuários.

- **id**: UUID (chave primária)
- **book_id**: Referência ao livro
- **user_id**: Referência ao usuário
- **page_number**: Número da página
- **position**: Posição específica na página
- **title**: Título opcional do marcador
- **note**: Nota opcional
- **created_at**: Data de criação
- **updated_at**: Data da última atualização

#### 4. `book_annotations`
Armazena as anotações dos usuários.

- **id**: UUID (chave primária)
- **book_id**: Referência ao livro
- **user_id**: Referência ao usuário
- **page_number**: Número da página
- **position**: Posição específica (opcional)
- **referenced_text**: Texto referenciado (opcional)
- **annotation**: Conteúdo da anotação
- **type**: Tipo da anotação (note, question, comment, etc.)
- **is_private**: Se a anotação é privada
- **created_at**: Data de criação
- **updated_at**: Data da última atualização

#### 5. `book_favorites`
Armazena os livros favoritos de cada usuário.

- **id**: UUID (chave primária)
- **book_id**: Referência ao livro
- **user_id**: Referência ao usuário
- **created_at**: Data em que foi marcado como favorito

## APIs Disponíveis

### Progresso de Leitura

#### GET `/api/books/[bookId]/progress`
Retorna o progresso de leitura do usuário para um livro específico.

#### POST `/api/books/[bookId]/progress`
Cria ou atualiza o progresso de leitura.

**Body:**
```json
{
  "currentPage": 50,
  "totalPages": 300,
  "progressPercent": 16.67,
  "lastPosition": "{\"page\": 50, \"paragraph\": 3}"
}
```

#### PATCH `/api/books/[bookId]/progress`
Atualiza o tempo de leitura.

**Body:**
```json
{
  "additionalSeconds": 1800
}
```

### Destaques

#### GET `/api/books/[bookId]/highlights`
Retorna todos os destaques do usuário em um livro.

#### POST `/api/books/[bookId]/highlights`
Cria um novo destaque.

**Body:**
```json
{
  "pageNumber": 42,
  "startPosition": "paragraph:3,word:5",
  "endPosition": "paragraph:3,word:25",
  "highlightedText": "Texto destacado aqui",
  "color": "#FFFF00",
  "note": "Nota opcional"
}
```

#### DELETE `/api/books/[bookId]/highlights`
Remove um destaque.

**Body:**
```json
{
  "highlightId": "uuid-do-destaque"
}
```

### Favoritos

#### GET `/api/books/[bookId]/favorite`
Verifica se o livro é favorito do usuário.

#### POST `/api/books/[bookId]/favorite`
Alterna o status de favorito do livro.

## Hook React: useBookReading

O hook `useBookReading` fornece uma interface completa para gerenciar todas as funcionalidades de leitura.

### Uso

```tsx
import { useBookReading } from '@/hooks/useBookReading';

function BookReader({ bookId, totalPages }) {
  const {
    // Estado
    progress,
    highlights,
    bookmarks,
    annotations,
    isFavorite,
    isLoading,
    
    // Ações
    updateProgress,
    startReadingSession,
    endReadingSession,
    addHighlight,
    removeHighlight,
    addBookmark,
    removeBookmark,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    toggleFavorite,
    
    // Utilidades
    refetch
  } = useBookReading({ bookId, totalPages });

  // Exemplo de uso
  const handlePageChange = (newPage) => {
    updateProgress(newPage);
  };

  const handleTextSelection = async (selectedText, position) => {
    const highlight = await addHighlight({
      pageNumber: currentPage,
      startPosition: position.start,
      endPosition: position.end,
      highlightedText: selectedText,
      color: '#FFFF00'
    });
  };

  // Gerenciar sessão de leitura
  useEffect(() => {
    startReadingSession();
    
    return () => {
      endReadingSession();
    };
  }, []);
}
```

## Integração com o KoodoViewer

Para integrar o sistema de rastreamento com o KoodoViewer, você pode:

1. **Ao abrir um livro**: Iniciar uma sessão de leitura
2. **Ao mudar de página**: Atualizar o progresso
3. **Ao selecionar texto**: Permitir criar destaques
4. **Ao fechar o livro**: Encerrar a sessão e salvar o tempo de leitura

### Exemplo de Integração

```tsx
// Em KoodoViewer.tsx
import { useBookReading } from '@/hooks/useBookReading';

export default function KoodoViewer({ book }) {
  const { 
    updateProgress, 
    startReadingSession, 
    endReadingSession,
    addHighlight 
  } = useBookReading({ 
    bookId: parseInt(book.id), 
    totalPages: book.pages || 100 
  });

  useEffect(() => {
    // Iniciar sessão ao abrir o livro
    startReadingSession();

    // Encerrar sessão ao fechar
    return () => {
      endReadingSession();
    };
  }, []);

  // Ao mudar de página
  const handlePageChange = (newPage) => {
    updateProgress(newPage);
  };

  // Ao criar destaque
  const handleHighlight = async (selection) => {
    await addHighlight({
      pageNumber: currentPage,
      startPosition: selection.start,
      endPosition: selection.end,
      highlightedText: selection.text
    });
  };
}
```

## Migração do Banco de Dados

Para aplicar as migrações:

```bash
# Executar a migration
psql -U seu_usuario -d seu_banco -f prisma/migrations/20250109_add_book_reading_tables.sql

# Ou via Prisma
npx prisma migrate dev
```

## Considerações de Performance

1. **Índices**: Todas as tabelas possuem índices apropriados para queries comuns
2. **Paginação**: APIs devem implementar paginação para grandes volumes de dados
3. **Cache**: Considerar cache para dados que não mudam frequentemente
4. **Batch Updates**: Para atualizações frequentes (como tempo de leitura), considerar batch updates

## Próximos Passos

1. Implementar as rotas API restantes (bookmarks, annotations)
2. Adicionar validação de dados nas APIs
3. Implementar paginação nas listagens
4. Adicionar testes unitários e de integração
5. Criar componentes UI para visualizar highlights, bookmarks e annotations
6. Implementar sincronização offline
7. Adicionar analytics de leitura (estatísticas detalhadas) 