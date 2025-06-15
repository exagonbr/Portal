// Mock database for institutions
// This is a temporary solution until a real database is implemented

// Shared mock database for institutions
export const mockInstitutions = new Map()

// Initialize with some sample institutions
const sampleInstitutions = [
  {
    id: 'inst_sabercon',
    name: 'Sabercon Educação',
    cnpj: '12345678000123',
    email: 'contato@sabercon.edu.br',
    phone: '(11) 1234-5678',
    address: {
      street: 'Rua da Educação',
      number: '123',
      complement: 'Sala 101',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567'
    },
    website: 'https://sabercon.edu.br',
    logo: 'https://sabercon.edu.br/logo.png',
    type: 'PRIVATE',
    active: true,
    settings: {
      allowStudentRegistration: true,
      requireEmailVerification: true,
      maxSchools: 10,
      maxUsersPerSchool: 1000
    },
    schools: [],
    users_count: 150,
    courses_count: 25,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin'
  },
  {
    id: 'inst_ifsp',
    name: 'Instituto Federal de São Paulo',
    cnpj: '98765432000198',
    email: 'contato@ifsp.edu.br',
    phone: '(11) 9876-5432',
    address: {
      street: 'Av. Principal',
      number: '456',
      complement: '',
      neighborhood: 'Vila Universitária',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '20000000'
    },
    website: 'https://ifsp.edu.br',
    logo: 'https://ifsp.edu.br/logo.png',
    type: 'PUBLIC',
    active: true,
    settings: {
      allowStudentRegistration: false,
      requireEmailVerification: true,
      maxSchools: 20,
      maxUsersPerSchool: 2000
    },
    schools: [],
    users_count: 500,
    courses_count: 45,
    created_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin'
  },
  {
    id: 'inst_unicamp',
    name: 'Universidade Estadual de Campinas',
    cnpj: '11223344000155',
    email: 'reitoria@unicamp.br',
    phone: '(19) 3521-4000',
    address: {
      street: 'Cidade Universitária',
      number: 'S/N',
      complement: 'Reitoria',
      neighborhood: 'Barão Geraldo',
      city: 'Campinas',
      state: 'SP',
      zipCode: '13083970'
    },
    website: 'https://unicamp.br',
    logo: 'https://unicamp.br/logo.png',
    type: 'PUBLIC',
    active: true,
    settings: {
      allowStudentRegistration: false,
      requireEmailVerification: true,
      maxSchools: 50,
      maxUsersPerSchool: 5000
    },
    schools: [],
    users_count: 2500,
    courses_count: 120,
    created_at: new Date('2024-03-01').toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'admin'
  }
];

// Populate the mock database
sampleInstitutions.forEach(institution => {
  mockInstitutions.set(institution.id, institution);
});

// Helper functions for working with the mock database
export const findInstitutionByEmail = (email: string, excludeId?: string) => {
  return Array.from(mockInstitutions.values()).find(
    (inst: any) => inst.email === email && (!excludeId || inst.id !== excludeId)
  )
}

export const findInstitutionByCNPJ = (cnpj: string, excludeId?: string) => {
  return Array.from(mockInstitutions.values()).find(
    (inst: any) => inst.cnpj === cnpj && (!excludeId || inst.id !== excludeId)
  )
}