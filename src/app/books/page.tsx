'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { bookService } from '@/services/bookService'
import GenericCRUD, { CRUDColumn } from '@/components/crud/GenericCRUD'
import { BookResponseDto } from '@/types/api'
import { useToast } from '@/components/ToastManager'
import { BookAddModal } from '@/components/BookAddModal'
import { BookEditModal } from '@/components/BookEditModal'
import { Badge } from '@/components/ui/Badge'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function BooksPage() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState<BookResponseDto[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [searchQuery, setSearchQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<any>(null)

  const fetchBooks = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const response = await bookService.getBooks({
        page,
        limit: itemsPerPage,
        filters: { search }
      })
      
      setBooks(response.items || [])
      setTotalItems(response.total || 0)
      setCurrentPage(page)
    } catch (error) {
      showError("Erro ao carregar livros", "Não foi possível carregar a lista de livros.");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks(currentPage, searchQuery)
  }, [currentPage])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    fetchBooks(1, query)
  }

  const handleAddBook = () => {
    setAddModalOpen(true)
  }

  const handleEditBook = (book: BookResponseDto) => {
    // BookResponseDto já tem a estrutura correta
    const adaptedBook = {
      id: book.id,
      title: book.name,
      subtitle: book.subtitle || '',
      author: book.author,
      category: book.category,
      pages: book.pages,
      description: book.subtitle || '', // Usar subtitle como description
      cover_url: book.cover_url || '',
      status: book.status
    };
    setSelectedBook(adaptedBook as any);
    setEditModalOpen(true);
  }

  const handleDeleteBook = async (book: BookResponseDto) => {
    try {
      await bookService.deleteBook(book.id)
      showSuccess("Livro excluído", "O livro foi excluído com sucesso.");
      fetchBooks(currentPage, searchQuery)
    } catch (error) {
      showError("Erro ao excluir livro", "Não foi possível excluir o livro.");
    }
  }

  const handleSaveBook = async (data: any) => {
    try {
      if (selectedBook) {
        await bookService.updateBook(selectedBook.id, data)
        showSuccess("Livro atualizado", "O livro foi atualizado com sucesso.");
      } else {
        await bookService.createBook(data)
        showSuccess("Livro criado", "O livro foi criado com sucesso.");
      }
      setAddModalOpen(false)
      setEditModalOpen(false)
      setSelectedBook(null)
      fetchBooks(currentPage, searchQuery)
    } catch (error) {
      showError("Erro ao salvar livro", "Não foi possível salvar o livro.");
    }
  }

  const handleViewBook = (book: BookResponseDto) => {
    router.push(`/books/${book.id}`)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'success'
      case 'draft': return 'warning'
      case 'archived': return 'secondary'
      default: return 'info'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado'
      case 'draft': return 'Rascunho'
      case 'archived': return 'Arquivado'
      default: return status
    }
  }

  const columns: CRUDColumn<BookResponseDto>[] = [
    {
      key: 'name',
      label: 'Título',
      sortable: true,
      render: (book) => (
        <div className="flex items-center space-x-3">
          {book.cover_url && (
            <img
              src={book.cover_url}
              alt={book.name}
              className="w-12 h-16 object-cover rounded"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{book.name}</div>
            {book.subtitle && (
              <div className="text-sm text-gray-500">{book.subtitle}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Autor',
      sortable: true
    },
    {
      key: 'category',
      label: 'Categoria',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (book) => (
        <Badge variant={getStatusBadgeVariant(book.status)}>
          {getStatusLabel(book.status)}
        </Badge>
      )
    },
    {
      key: 'pages',
      label: 'Páginas',
      sortable: true
    },
    {
      key: 'published_date',
      label: 'Publicação',
      render: (book) => book.published_date 
        ? new Date(book.published_date).toLocaleDateString('pt-BR')
        : '-'
    }
  ]

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8">
        <GenericCRUD
          title="Biblioteca Digital"
          entityName="Livro"
          entityNamePlural="Livros"
          columns={columns}
          data={books}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onSearch={handleSearch}
          onCreate={handleAddBook}
          onEdit={handleEditBook}
          onDelete={handleDeleteBook}
          onView={handleViewBook}
          searchPlaceholder="Buscar livros por título, autor..."
          createPermission="books.create"
          editPermission="books.edit"
          deletePermission="books.delete"
          viewPermission="books.view"
        />

        {addModalOpen && (
          <BookAddModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSave={handleSaveBook}
            title="Adicionar Livro"
          />
        )}

        {editModalOpen && selectedBook && (
          <BookEditModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false)
              setSelectedBook(null)
            }}
            onSave={handleSaveBook}
            book={selectedBook}
            title="Editar Livro"
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
} 