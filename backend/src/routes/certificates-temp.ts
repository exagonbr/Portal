import { Router, Request, Response } from 'express';

const router = Router();

// Dados mockados temporários
const mockCertificates = [
  {
    id: 1,
    version: 1,
    date_created: new Date('2024-01-01'),
    last_updated: new Date('2024-01-01'),
    path: '/certificates/cert1.pdf',
    score: 85,
    tv_show_id: 1,
    user_id: 1,
    document: 'DOC001',
    license_code: 'LIC001',
    tv_show_name: 'Curso de Matemática',
    recreate: false
  },
  {
    id: 2,
    version: 1,
    date_created: new Date('2024-01-02'),
    last_updated: new Date('2024-01-02'),
    path: '/certificates/cert2.pdf',
    score: 92,
    tv_show_id: 2,
    user_id: 2,
    document: 'DOC002',
    license_code: 'LIC002',
    tv_show_name: 'Curso de Português',
    recreate: false
  },
  {
    id: 3,
    version: 1,
    date_created: new Date('2024-01-03'),
    last_updated: new Date('2024-01-03'),
    path: '/certificates/cert3.pdf',
    score: 78,
    tv_show_id: 3,
    user_id: 3,
    document: 'DOC003',
    license_code: 'LIC003',
    tv_show_name: 'Curso de História',
    recreate: true
  }
];

// GET /api/certificates - Listar certificados com filtros e paginação
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('📋 Buscando certificados (dados mockados)...');
    
    const {
      page = 1,
      limit = 10,
      user_id,
      tv_show_id,
      score,
      document,
      license_code,
      tv_show_name,
      recreate,
      search,
      sort_by = 'date_created',
      sort_order = 'desc'
    } = req.query;

    let filteredCertificates = [...mockCertificates];

    // Aplicar filtros
    if (user_id) {
      filteredCertificates = filteredCertificates.filter(cert => cert.user_id === Number(user_id));
    }
    if (tv_show_id) {
      filteredCertificates = filteredCertificates.filter(cert => cert.tv_show_id === Number(tv_show_id));
    }
    if (score) {
      filteredCertificates = filteredCertificates.filter(cert => cert.score === Number(score));
    }
    if (document) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.document?.toLowerCase().includes(String(document).toLowerCase())
      );
    }
    if (license_code) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.license_code?.toLowerCase().includes(String(license_code).toLowerCase())
      );
    }
    if (tv_show_name) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.tv_show_name?.toLowerCase().includes(String(tv_show_name).toLowerCase())
      );
    }
    if (recreate !== undefined) {
      filteredCertificates = filteredCertificates.filter(cert => cert.recreate === (recreate === 'true'));
    }
    if (search) {
      const searchTerm = String(search).toLowerCase();
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.document?.toLowerCase().includes(searchTerm) ||
        cert.license_code?.toLowerCase().includes(searchTerm) ||
        cert.tv_show_name?.toLowerCase().includes(searchTerm) ||
        cert.path?.toLowerCase().includes(searchTerm)
      );
    }

    // Ordenação
    const sortField = ['date_created', 'last_updated', 'score', 'tv_show_name'].includes(String(sort_by)) 
      ? String(sort_by) : 'date_created';
    const sortDirection = sort_order === 'asc' ? 1 : -1;
    
    filteredCertificates.sort((a, b) => {
      const aVal = (a as any)[sortField];
      const bVal = (b as any)[sortField];
      if (aVal < bVal) return -1 * sortDirection;
      if (aVal > bVal) return 1 * sortDirection;
      return 0;
    });

    // Paginação
    const total = filteredCertificates.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paginatedCertificates = filteredCertificates.slice(offset, offset + Number(limit));
    const totalPages = Math.ceil(total / Number(limit));

    console.log(`✅ Retornando ${paginatedCertificates.length} certificados de ${total} total`);

    return res.json({
      success: true,
      data: paginatedCertificates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/certificates/:id - Buscar certificado por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const certificate = mockCertificates.find(cert => cert.id === Number(id));

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    return res.json({
      success: true,
      data: certificate
    });

  } catch (error) {
    console.error('Erro ao buscar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/certificates - Criar novo certificado
router.post('/', async (req: Request, res: Response) => {
  try {
    const newCertificate = {
      id: mockCertificates.length + 1,
      version: 1,
      date_created: new Date(),
      last_updated: new Date(),
      ...req.body
    };

    mockCertificates.push(newCertificate);

    return res.status(201).json({
      success: true,
      data: newCertificate,
      message: 'Certificado criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/certificates/:id - Atualizar certificado
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const certificateIndex = mockCertificates.findIndex(cert => cert.id === Number(id));

    if (certificateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    mockCertificates[certificateIndex] = {
      ...mockCertificates[certificateIndex],
      ...req.body,
      last_updated: new Date()
    };

    return res.json({
      success: true,
      data: mockCertificates[certificateIndex],
      message: 'Certificado atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/certificates/:id - Excluir certificado
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const certificateIndex = mockCertificates.findIndex(cert => cert.id === Number(id));

    if (certificateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    const deletedCertificate = mockCertificates.splice(certificateIndex, 1)[0];

    return res.json({
      success: true,
      message: 'Certificado excluído com sucesso',
      data: { id: deletedCertificate.id }
    });

  } catch (error) {
    console.error('Erro ao excluir certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;