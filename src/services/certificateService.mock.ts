import {
  CertificateResponseDto,
  PaginatedResponse,
  BaseFilterDto,
  CreateCertificateDto,
  UpdateCertificateDto,
} from '@/types/api';

const certificates: CertificateResponseDto[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  user_id: String((i % 5) + 1), // Associa a um dos 5 usuários mock
  tv_show_id: String((i % 3) + 1), // Associa a um dos 3 TV shows mock
  tv_show_name: `Programa Educativo ${(i % 3) + 1}`,
  document: `CERT-2024-${String(i + 1).padStart(4, '0')}`,
  license_code: `LIC-${String(Math.random().toString(36).substr(2, 9)).toUpperCase()}`,
  score: Math.floor(Math.random() * 41) + 60, // Pontuação entre 60 e 100
  recreate: i % 4 === 0, // 1 a cada 4 é recriável
  date_created: new Date(new Date().setDate(new Date().getDate() - i)).toISOString(),
  last_updated: new Date().toISOString()
}));

const applyFilters = (certs: CertificateResponseDto[], filters: BaseFilterDto & { recreate?: boolean, tv_show_name?: string }) => {
  let filtered = certs;
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.document?.toLowerCase().includes(search) ||
      c.license_code?.toLowerCase().includes(search)
    );
  }
  if (filters.recreate !== undefined) {
    filtered = filtered.filter(c => c.recreate === filters.recreate);
  }
  if (filters.tv_show_name) {
    filtered = filtered.filter(c => c.tv_show_name === filters.tv_show_name);
  }
  return filtered;
};

export const getCertificates = async (filters: BaseFilterDto = {}): Promise<PaginatedResponse<CertificateResponseDto>> => {
  const filteredData = applyFilters(certificates, filters);
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const paginatedItems = filteredData.slice((page - 1) * limit, page * limit);

  return Promise.resolve({
    items: paginatedItems,
    total: filteredData.length,
    page,
    limit,
    totalPages: Math.ceil(filteredData.length / limit),
  });
};

export const getCertificateById = async (id: number): Promise<CertificateResponseDto> => {
  const certificate = certificates.find(c => c.id === id);
  if (certificate) {
    return Promise.resolve(certificate);
  }
  return Promise.reject(new Error('Certificate not found'));
};

export const createCertificate = async (data: CreateCertificateDto): Promise<CertificateResponseDto> => {
  const newId = Math.max(...certificates.map(c => c.id)) + 1;
  const newCertificate: CertificateResponseDto = {
    id: newId,
    ...data,
    date_created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };
  certificates.unshift(newCertificate);
  return Promise.resolve(newCertificate);
};

export const updateCertificate = async (id: number, data: UpdateCertificateDto): Promise<CertificateResponseDto> => {
  const index = certificates.findIndex(c => c.id === id);
  if (index > -1) {
    certificates[index] = { ...certificates[index], ...data, last_updated: new Date().toISOString() };
    return Promise.resolve(certificates[index]);
  }
  return Promise.reject(new Error('Certificate not found'));
};

export const deleteCertificate = async (id: number): Promise<void> => {
  const index = certificates.findIndex(c => c.id === id);
  if (index > -1) {
    certificates.splice(index, 1);
    return Promise.resolve();
  }
  return Promise.reject(new Error('Certificate not found'));
};

export const certificateService = {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};