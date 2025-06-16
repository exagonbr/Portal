import { 
  BaseEntity, 
  BaseEntityDto, 
  InstitutionType, 
  ContactInfo, 
  BaseFilter,
  UUID,
  DateString,
  Phone,
  Email,
  INSTITUTION_TYPE_LABELS
} from './common';

export { InstitutionType, INSTITUTION_TYPE_LABELS };

export interface Institution extends BaseEntity {
  name: string;
  code: string;
  type: InstitutionType;
  description?: string;
  email?: Email;
  phone?: Phone;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active: boolean;
}

export interface InstitutionDto extends BaseEntityDto {
  name: string;
  code: string;
  type: InstitutionType;
  description?: string;
  email?: Email;
  phone?: Phone;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active: boolean;
  schools_count?: number;
  users_count?: number;
  active_courses?: number;
}

export interface CreateInstitutionDto {
  name: string;
  code: string;
  type: InstitutionType;
  description?: string;
  email?: Email;
  phone?: Phone;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface UpdateInstitutionDto {
  name?: string;
  code?: string;
  type?: InstitutionType;
  description?: string;
  email?: Email;
  phone?: Phone;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface InstitutionFilter extends BaseFilter {
  type?: InstitutionType;
  city?: string;
  state?: string;
  sortBy?: keyof Institution;
}

export interface InstitutionStats {
  total_institutions: number;
  active_institutions: number;
  total_schools: number;
  total_users: number;
  total_courses: number;
  institutions_by_type: Record<InstitutionType, number>;
  institutions_by_state: Record<string, number>;
}

export const INSTITUTION_TYPE_COLORS: Record<InstitutionType, string> = {
  PUBLIC: '#4CAF50',
  PRIVATE: '#2196F3',
  MIXED: '#FF9800'
};

export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];