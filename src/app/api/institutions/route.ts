import { NextRequest, NextResponse } from 'next/server';
import { createStandardApiRoute } from '../lib/api-route-template';
import { createCorsOptionsResponse } from '@/config/cors';

// Dados mockados para fallback
let mockInstitutions = [
  {
    id: 1,
    name: 'Instituição Principal (Mock)',
    company_name: 'Principal LTDA',
    document: '12.345.678/0001-99',
    state: 'SP',
    district: 'Centro',
    street: 'Rua Fictícia',
    postal_code: '01000-000',
    accountable_contact: 'financeiro@principal.com',
    accountable_name: 'Sr. Financeiro',
    contract_disabled: false,
    contract_term_end: new Date().toISOString(),
    contract_term_start: new Date().toISOString(),
    deleted: false,
    has_library_platform: true,
    has_principal_platform: true,
    has_student_platform: true,
  },
  {
    id: 2,
    name: 'Instituição Secundária (Mock)',
    company_name: 'Secundária SA',
    document: '98.765.432/0001-11',
    state: 'RJ',
    district: 'Copacabana',
    street: 'Avenida Atlântica',
    postal_code: '22000-000',
    accountable_contact: 'contato@secundaria.com',
    accountable_name: 'Sra. Contato',
    contract_disabled: false,
    contract_term_end: new Date().toISOString(),
    contract_term_start: new Date().toISOString(),
    deleted: false,
    has_library_platform: false,
    has_principal_platform: true,
    has_student_platform: true,
  },
];

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/institutions',
  name: 'institutions',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const search = url.searchParams.get('search') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');

      // Usar dados mockados em vez de chamar o serviço novamente
      console.log('📚 [API-INSTITUTIONS] Usando dados mockados para fallback');
      
      // Filtrar por busca se necessário
      let filteredInstitutions = mockInstitutions;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredInstitutions = mockInstitutions.filter(
          inst => inst.name.toLowerCase().includes(searchLower) || 
                 inst.company_name.toLowerCase().includes(searchLower)
        );
      }
      
      // Aplicar paginação
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedInstitutions = filteredInstitutions.slice(start, end);
      
      return NextResponse.json({
        items: paginatedInstitutions,
        total: filteredInstitutions.length,
        page,
        limit,
        totalPages: Math.ceil(filteredInstitutions.length / limit)
      });
    } catch (error) {
      console.error('Error in institutions fallback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch institutions', items: [] },
        { status: 500 }
      );
    }
  }
});

// POST handler
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Criar nova instituição com dados mockados
    const newId = Math.max(...mockInstitutions.map(i => i.id)) + 1;
    const newInstitution = {
      id: newId,
      ...data,
      contract_term_start: new Date().toISOString(),
      contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      deleted: false
    };
    
    mockInstitutions.push(newInstitution);
    console.log('📝 [API-INSTITUTIONS] Instituição criada com mock:', newInstitution);
    
    return NextResponse.json(newInstitution, { status: 201 });
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json(
      { error: 'Failed to create institution' },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();
    
    // Atualizar instituição mockada
    const institutionIndex = mockInstitutions.findIndex(i => i.id === Number(id));
    if (institutionIndex === -1) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }
    
    const updatedInstitution = {
      ...mockInstitutions[institutionIndex],
      ...data,
    };
    
    mockInstitutions[institutionIndex] = updatedInstitution;
    console.log('✏️ [API-INSTITUTIONS] Instituição atualizada com mock:', updatedInstitution);
    
    return NextResponse.json(updatedInstitution);
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json(
      { error: 'Failed to update institution' },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    // Excluir instituição mockada
    const institutionIndex = mockInstitutions.findIndex(i => i.id === Number(id));
    if (institutionIndex === -1) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }
    
    mockInstitutions = mockInstitutions.filter(i => i.id !== Number(id));
    console.log('🗑️ [API-INSTITUTIONS] Instituição excluída com mock:', id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json(
      { error: 'Failed to delete institution' },
      { status: 500 }
    );
  }
}

// PATCH handler for toggle status
export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    // Alternar status da instituição mockada
    const institutionIndex = mockInstitutions.findIndex(i => i.id === Number(id));
    if (institutionIndex === -1) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }
    
    const institution = mockInstitutions[institutionIndex];
    const updatedInstitution = {
      ...institution,
      deleted: !institution.deleted
    };
    
    mockInstitutions[institutionIndex] = updatedInstitution;
    console.log('🔄 [API-INSTITUTIONS] Status da instituição alternado com mock:', updatedInstitution);
    
    return NextResponse.json(updatedInstitution);
  } catch (error) {
    console.error('Error toggling institution status:', error);
    return NextResponse.json(
      { error: 'Failed to toggle institution status' },
      { status: 500 }
    );
  }
} 
