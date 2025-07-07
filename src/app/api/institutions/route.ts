import { NextRequest, NextResponse } from 'next/server';
import { createStandardApiRoute } from '../lib/api-route-template';
import { createCorsOptionsResponse } from '@/config/cors';

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/institutions',
  name: 'institutions',
  fallbackFunction: async (req: NextRequest) => {
    // Dados mock como fallback
    const mockInstitutions = [
      {
        id: '1',
        name: 'Colégio Excelência',
        document: '12.345.678/0001-95',
        state: 'SP',
        district: 'Centro',
        street: 'Rua da Educação, 123',
        postal_code: '01234-567',
        accountable_contact: 'contato@colegioexcelencia.com.br',
        accountable_name: 'Diretor Silva',
        contract_disabled: false,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true,
        deleted: false
      },
      {
        id: '2',
        name: 'Instituto Tecnológico ITECH',
        document: '98.765.432/0001-12',
        state: 'RJ',
        district: 'Copacabana',
        street: 'Av. Tecnologia, 456',
        postal_code: '20123-456',
        accountable_contact: 'contato@itech.edu.br',
        accountable_name: 'Diretora Ana',
        contract_disabled: false,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true,
        deleted: false
      },
      {
        id: '3',
        name: 'Universidade Futuro',
        document: '11.222.333/0001-44',
        state: 'SP',
        district: 'Butantã',
        street: 'Campus Universitário, s/n',
        postal_code: '05678-901',
        accountable_contact: 'reitoria@unifuturo.edu.br',
        accountable_name: 'Reitor José',
        contract_disabled: false,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true,
        deleted: false
      }
    ];

    // Aplicar filtros se houver
    const url = new URL(req.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    
    let filteredItems = mockInstitutions;
    if (search) {
      filteredItems = mockInstitutions.filter(
        inst => inst.name.toLowerCase().includes(search) || 
                inst.document.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      items: filteredItems,
      total: filteredItems.length,
      page: 1,
      limit: filteredItems.length,
      totalPages: 1,
    });
  }
});

// Manter o POST existente, mas refatorar para usar o template no futuro
export { POST } from './post-route'; 
