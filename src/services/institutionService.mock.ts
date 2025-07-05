import { InstitutionResponseDto, PaginatedResponse } from '@/types/api';
import { BaseFilterDto } from '@/types/api';

const institutions: InstitutionResponseDto[] = [
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

export const getInstitutions = async (params: BaseFilterDto = {}): Promise<PaginatedResponse<InstitutionResponseDto>> => {
  console.log('Usando mock: getInstitutions');
  return Promise.resolve({
    items: institutions,
    total: institutions.length,
    page: params.page || 1,
    limit: params.limit || 10,
    totalPages: 1,
  });
};

export const institutionService = {
  getInstitutions,
};