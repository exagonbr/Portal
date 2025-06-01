import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, author or ISBN
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const userInstitutionId = req.user?.institutionId;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('books')
      .leftJoin('institutions', 'books.institution_id', 'institutions.id')
      .select([
        'books.*',
        'institutions.name as institution_name'
      ])
      .where('books.status', 'available');

    // Filtrar por instituição do usuário se não for admin
    if (userInstitutionId && req.user?.role !== 'admin') {
      query = query.where('books.institution_id', userInstitutionId);
    }

    // Aplicar filtros
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(function() {
        this.where('books.title', 'ilike', searchTerm)
          .orWhere('books.author', 'ilike', searchTerm)
          .orWhere('books.isbn', 'ilike', searchTerm);
      });
    }

    if (category) {
      query = query.where('books.category', category);
    }

    // Contar total de registros
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('* as count');
    const total = Number(count);

    // Aplicar paginação
    const books = await query
      .orderBy('books.title')
      .limit(Number(limit))
      .offset(offset);

    const totalPages = Math.ceil(total / Number(limit));

    return res.json({
      success: true,
      data: books,
      total,
      page: Number(page),
      totalPages
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search books
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', validateJWT, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro de busca é obrigatório'
      });
    }

    const searchTerm = `%${q}%`;
    const userInstitutionId = req.user?.institutionId;

    let query = db('books')
      .leftJoin('institutions', 'books.institution_id', 'institutions.id')
      .select([
        'books.*',
        'institutions.name as institution_name'
      ])
      .where('books.status', 'available')
      .where(function() {
        this.where('books.title', 'ilike', searchTerm)
          .orWhere('books.author', 'ilike', searchTerm)
          .orWhere('books.isbn', 'ilike', searchTerm)
          .orWhere('books.description', 'ilike', searchTerm);
      });

    // Filtrar por instituição se não for admin
    if (userInstitutionId && req.user?.role !== 'admin') {
      query = query.where('books.institution_id', userInstitutionId);
    }

    const books = await query.orderBy('books.title').limit(50);

    return res.json({
      success: true,
      data: books,
      total: books.length
    });
  } catch (error) {
    console.error('Error searching books:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Book found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:id', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    const book = await db('books')
      .leftJoin('institutions', 'books.institution_id', 'institutions.id')
      .select([
        'books.*',
        'institutions.name as institution_name'
      ])
      .where('books.id', id)
      .first();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Livro não encontrado'
      });
    }

    // Verificar se o usuário tem acesso ao livro
    if (userInstitutionId && book.institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    return res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - institution_id
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               publisher:
 *                 type: string
 *               publication_year:
 *                 type: integer
 *               language:
 *                 type: string
 *               pages:
 *                 type: integer
 *               category:
 *                 type: string
 *               cover_url:
 *                 type: string
 *               file_url:
 *                 type: string
 *               file_type:
 *                 type: string
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Book created
 *       400:
 *         description: Invalid input
 */
router.post('/', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      description,
      publisher,
      publication_year,
      language = 'pt-BR',
      pages,
      category,
      cover_url,
      file_url,
      file_type,
      file_size,
      institution_id
    } = req.body;

    const userInstitutionId = req.user?.institutionId;

    // Validar campos obrigatórios
    if (!title || !author || !institution_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, author, institution_id'
      });
    }

    // Verificar se o usuário pode criar livro nesta instituição
    if (userInstitutionId && institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você só pode criar livros em sua própria instituição'
      });
    }

    // Verificar se ISBN já existe (se fornecido)
    if (isbn) {
      const existingBook = await db('books').where('isbn', isbn).first();
      if (existingBook) {
        return res.status(409).json({
          success: false,
          message: 'ISBN já está em uso'
        });
      }
    }

    const bookData = {
      title,
      author,
      isbn,
      description,
      publisher,
      publication_year,
      language,
      pages,
      category,
      cover_url,
      file_url,
      file_type,
      file_size,
      institution_id,
      status: 'available',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newBook] = await db('books').insert(bookData).returning('*');

    return res.status(201).json({
      success: true,
      data: newBook,
      message: 'Livro criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, unavailable]
 *     responses:
 *       200:
 *         description: Book updated
 *       404:
 *         description: Book not found
 */
router.put('/:id', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    // Verificar se o livro existe
    const existingBook = await db('books').where('id', id).first();

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Livro não encontrado'
      });
    }

    // Verificar permissões
    if (userInstitutionId && existingBook.institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este livro'
      });
    }

    const {
      title,
      author,
      description,
      publisher,
      publication_year,
      pages,
      category,
      cover_url,
      file_url,
      file_type,
      file_size,
      status
    } = req.body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (description !== undefined) updateData.description = description;
    if (publisher !== undefined) updateData.publisher = publisher;
    if (publication_year !== undefined) updateData.publication_year = publication_year;
    if (pages !== undefined) updateData.pages = pages;
    if (category !== undefined) updateData.category = category;
    if (cover_url !== undefined) updateData.cover_url = cover_url;
    if (file_url !== undefined) updateData.file_url = file_url;
    if (file_type !== undefined) updateData.file_type = file_type;
    if (file_size !== undefined) updateData.file_size = file_size;
    if (status !== undefined) updateData.status = status;

    await db('books').where('id', id).update(updateData);

    const updatedBook = await db('books')
      .leftJoin('institutions', 'books.institution_id', 'institutions.id')
      .select([
        'books.*',
        'institutions.name as institution_name'
      ])
      .where('books.id', id)
      .first();

    return res.json({
      success: true,
      data: updatedBook,
      message: 'Livro atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Book deleted
 *       404:
 *         description: Book not found
 */
router.delete('/:id', validateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const existingBook = await db('books').where('id', id).first();

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Livro não encontrado'
      });
    }

    // Soft delete: marcar como indisponível ao invés de deletar
    await db('books')
      .where('id', id)
      .update({
        status: 'unavailable',
        updated_at: new Date()
      });

    return res.json({
      success: true,
      message: 'Livro removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
