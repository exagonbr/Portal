import { 
  BaseEntity, 
  BaseEntityDto, 
  InstitutionType, 
  BaseFilter,
  UUID,
  DateString,
  Phone,
  Email,
  INSTITUTION_TYPE_LABELS
} from './common';

// Re-export tipos importantes para garantir disponibilidade
export { InstitutionType, INSTITUTION_TYPE_LABELS };

// Enum para natureza da instituição (público/privado)
export enum InstitutionNature {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  MIXED = 'MIXED'
}

// Labels para natureza da instituição
export const INSTITUTION_NATURE_LABELS: Record<InstitutionNature, string> = {
  [InstitutionNature.PUBLIC]: 'Pública',
  [InstitutionNature.PRIVATE]: 'Privada',
  [InstitutionNature.MIXED]: 'Mista'
};

// Cores para os tipos de instituição
export const INSTITUTION_TYPE_COLORS: Record<InstitutionType, string> = {
  SCHOOL: '#4CAF50',
  COLLEGE: '#2196F3', 
  UNIVERSITY: '#9C27B0',
  TECH_CENTER: '#FF9800'
};

// Cores para a natureza da instituição
export const INSTITUTION_NATURE_COLORS: Record<InstitutionNature, string> = {
  PUBLIC: '#4CAF50',
  PRIVATE: '#2196F3',
  MIXED: '#FF9800'
};

// Interface principal da Instituição
export interface Institution extends BaseEntity {
  name: string;
  code: string;
  cnpj?: string;
  type: InstitutionType;
  nature?: InstitutionNature; // Público, privado ou misto
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

// DTO da Instituição
export interface InstitutionDto extends BaseEntityDto {
  name: string;
  code: string;
  cnpj?: string;
  type: InstitutionType;
  nature?: InstitutionNature; // Público, privado ou misto
  description?: string;
  email?: Email;
  phone?: Phone;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  logo?: string; // Alias para logo_url para compatibilidade
  is_active: boolean;
  active?: boolean; // Alias para is_active para compatibilidade
  created_by?: string; // Campo adicional para compatibilidade
  schools_count?: number;
  users_count?: number;
  active_courses?: number;
  courses_count?: number; // Alias para active_courses
  
  // Campos adicionais da tabela institution
  version?: number;
  company_name?: string;
  document?: string;
  accountable_contact?: string;
  accountable_name?: string;
  street?: string;
  complement?: string;
  district?: string;
  postal_code?: string;
  contract_disabled?: boolean;
  contract_invoice_num?: string;
  contract_num?: number;
  contract_term_start?: string | Date;
  contract_term_end?: string | Date;
  invoice_date?: string | Date;
  score?: number;
  has_library_platform?: boolean;
  has_principal_platform?: boolean;
  has_student_platform?: boolean;
}

// DTO para criação de Instituição
export interface CreateInstitutionDto {
  name: string;
  code: string;
  cnpj?: string;
  type: InstitutionType;
  nature?: InstitutionNature; // Público, privado ou misto
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
  
  // Campos adicionais da tabela institution
  company_name?: string;
  document?: string;
  accountable_contact?: string;
  accountable_name?: string;
  street?: string;
  complement?: string;
  district?: string;
  postal_code?: string;
  contract_disabled?: boolean;
  contract_invoice_num?: string;
  contract_num?: number;
  contract_term_start?: string | Date;
  contract_term_end?: string | Date;
  score?: number;
  has_library_platform?: boolean;
  has_principal_platform?: boolean;
  has_student_platform?: boolean;
}

// DTO para atualização de Instituição
export interface UpdateInstitutionDto {
  name?: string;
  code?: string;
  cnpj?: string;
  type?: InstitutionType;
  nature?: InstitutionNature; // Público, privado ou misto
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

// Interface para filtros de Instituição
export interface InstitutionFilter extends BaseFilter {
  type?: InstitutionType;
  nature?: InstitutionNature;
  city?: string;
  state?: string;
  sortBy?: keyof Institution;
}

// Interface para estatísticas de Instituição
export interface InstitutionStats {
  total_institutions: number;
  active_institutions: number;
  total_schools: number;
  total_users: number;
  total_courses: number;
  institutions_by_type: Record<InstitutionType, number>;
  institutions_by_nature: Record<InstitutionNature, number>;
  institutions_by_state: Record<string, number>;
}

// Interface para análise de dados da Instituição
export interface InstitutionAnalytics {
  user_growth: { date: string; count: number }[];
  course_completion_rate: { course_name: string; rate: number }[];
  most_active_courses: { course_name: string; activity_count: number }[];
  login_trends: { date: string; logins: number }[];
  user_demographics: { state: string; count: number }[];
}
// Estados brasileiros
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