import { api } from './api'
import { BookResponseDto, BookCreateDto, BookUpdateDto, PaginatedResponse } from '@/types/api'

interface BookFilters {
  search?: string
  category?: string
  author?: string
  status?: string
}

interface GetBooksParams {
  page?: number
  limit?: number
  filters?: BookFilters
}

export const bookService = {
  async getBooks(params: GetBooksParams = {}): Promise<PaginatedResponse<BookResponseDto>> {
    try {
      const { page = 1, limit = 10, filters = {} } = params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      })

      const response = await api.get(`/books?${queryParams}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar livros:', error)
      // Retornar dados mock em caso de erro
      return {
        items: [
          {
            id: '1',
            title: 'Introdução à Programação',
            subtitle: 'Conceitos básicos e práticos',
            author: 'João Silva',
            category: 'Tecnologia',
            status: 'published',
            pages: 320,
            cover_url: 'https://via.placeholder.com/150x200',
            published_date: '2023-01-15',
            created_at: '2023-01-01',
            updated_at: '2023-01-15'
          },
          {
            id: '2',
            title: 'Matemática Avançada',
            subtitle: 'Cálculo e álgebra linear',
            author: 'Maria Santos',
            category: 'Matemática',
            status: 'published',
            pages: 450,
            cover_url: 'https://via.placeholder.com/150x200',
            published_date: '2023-02-20',
            created_at: '2023-02-01',
            updated_at: '2023-02-20'
          }
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  },

  async getBookById(id: string): Promise<BookResponseDto> {
    try {
      const response = await api.get(`/books/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar livro:', error)
      throw error
    }
  },

  async createBook(data: BookCreateDto): Promise<BookResponseDto> {
    try {
      const response = await api.post('/books', data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar livro:', error)
      throw error
    }
  },

  async updateBook(id: string, data: BookUpdateDto): Promise<BookResponseDto> {
    try {
      const response = await api.put(`/books/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar livro:', error)
      throw error
    }
  },

  async deleteBook(id: string): Promise<void> {
    try {
      await api.delete(`/books/${id}`)
    } catch (error) {
      console.error('Erro ao excluir livro:', error)
      throw error
    }
  },

  async getBooksByCategory(category: string): Promise<BookResponseDto[]> {
    try {
      const response = await api.get(`/books/category/${category}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar livros por categoria:', error)
      return []
    }
  },

  async searchBooks(query: string): Promise<BookResponseDto[]> {
    try {
      const response = await api.get(`/books/search?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.error('Erro ao pesquisar livros:', error)
      return []
    }
  }
} 