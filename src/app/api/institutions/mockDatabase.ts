// Mock database for institutions
// This is a temporary solution until a real database is implemented

// Shared mock database for institutions
export const mockInstitutions = new Map()

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