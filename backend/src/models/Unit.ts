export interface Unit {
  id: string;
  version?: number;
  date_created?: Date;
  deleted?: boolean;
  institution_id: string;
  last_updated?: Date;
  name: string;
  institution_name?: string;
  description?: string;
  type?: 'school' | 'college' | 'university' | 'campus';
  active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUnitData {
  name: string;
  institution_id: string;
  description?: string;
  type?: 'school' | 'college' | 'university' | 'campus';
}

export interface UpdateUnitData {
  name?: string;
  institution_id?: string;
  description?: string;
  type?: 'school' | 'college' | 'university' | 'campus';
  active?: boolean;
}

export interface UnitFilters {
  name?: string;
  search?: string;
  type?: string;
  active?: boolean;
  institution_id?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUnitResponse {
  items: Unit[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}