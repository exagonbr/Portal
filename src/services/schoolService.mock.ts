import {
  SchoolResponseDto,
  PaginatedResponse,
  BaseFilterDto,
  CreateSchoolDto,
  UpdateSchoolDto,
} from '@/types/api';

const schools: SchoolResponseDto[] = [
  {
    id: 101,
    name: 'Escola Futuro Brilhante - Unidade Centro',
    institutionId: 1,
    institutionName: 'Rede Educacional Futuro Brilhante',
    total_students: 856,
    total_teachers: 42,
    total_classes: 24,
    deleted: false,
    date_created: '2023-01-15T10:30:00.000Z',
    last_updated: '2024-11-20T14:45:00.000Z'
  },
  {
    id: 102,
    name: 'Colégio Futuro Brilhante - Vila Nova',
    institutionId: 1,
    institutionName: 'Rede Educacional Futuro Brilhante',
    total_students: 620,
    total_teachers: 38,
    total_classes: 18,
    deleted: false,
    date_created: '2023-03-10T09:00:00.000Z',
    last_updated: '2024-12-01T16:20:00.000Z'
  },
  {
    id: 201,
    name: 'Instituto Nova Era - Campus Principal',
    institutionId: 2,
    institutionName: 'Instituto Educacional Nova Era',
    total_students: 3500,
    total_teachers: 180,
    total_classes: 45,
    deleted: false,
    date_created: '2022-07-15T08:00:00.000Z',
    last_updated: '2024-12-10T17:00:00.000Z'
  },
  {
    id: 301,
    name: 'Escola Conhecimento - Asa Norte',
    institutionId: 3,
    institutionName: 'Grupo Educacional Conhecimento',
    total_students: 980,
    total_teachers: 52,
    total_classes: 28,
    deleted: false,
    date_created: '2023-04-10T08:30:00.000Z',
    last_updated: '2024-12-05T14:20:00.000Z'
  },
];

const applyFilters = (schs: SchoolResponseDto[], filters: BaseFilterDto & { institutionId?: number }) => {
  let filtered = schs;
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.institutionName?.toLowerCase().includes(search)
    );
  }
  if (filters.institutionId) {
    filtered = filtered.filter(s => s.institutionId === filters.institutionId);
  }
  return filtered;
};

export const getSchools = async (filters: BaseFilterDto = {}): Promise<PaginatedResponse<SchoolResponseDto>> => {
  const filteredData = applyFilters(schools, filters);
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

export const getSchoolById = async (id: number): Promise<SchoolResponseDto> => {
  const school = schools.find(s => s.id === id);
  if (school) {
    return Promise.resolve(school);
  }
  return Promise.reject(new Error('School not found'));
};

export const createSchool = async (data: CreateSchoolDto): Promise<SchoolResponseDto> => {
  const newId = Math.max(...schools.map(s => s.id)) + 1;
  const newSchool: SchoolResponseDto = {
    id: newId,
    ...data,
    deleted: false,
    date_created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
  };
  schools.unshift(newSchool);
  return Promise.resolve(newSchool);
};

export const updateSchool = async (id: number, data: UpdateSchoolDto): Promise<SchoolResponseDto> => {
  const index = schools.findIndex(s => s.id === id);
  if (index > -1) {
    schools[index] = { ...schools[index], ...data, last_updated: new Date().toISOString() };
    return Promise.resolve(schools[index]);
  }
  return Promise.reject(new Error('School not found'));
};

export const deleteSchool = async (id: number): Promise<void> => {
  const index = schools.findIndex(s => s.id === id);
  if (index > -1) {
    schools.splice(index, 1);
    return Promise.resolve();
  }
  return Promise.reject(new Error('School not found'));
};

export const schoolService = {
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
};