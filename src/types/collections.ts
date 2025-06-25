export interface TVShowCollection {
  id: number;
  name: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date?: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  producer?: string;
  total_load?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// Novos tipos para gerenciamento completo de coleções
export interface CollectionFormData {
  id?: number;
  name: string;
  synopsis: string;
  producer: string;
  release_date: string;
  contract_expiry_date: string;
  authors: string[];
  target_audience: string[];
  total_hours: string; // formato HH:MM:SS
  poster_image?: File | string; // Capa principal
  carousel_image?: File | string; // Imagem do carrossel
  ebook_file?: File | string; // Material complementar
  use_default_cover_for_videos: boolean;
}

export interface VideoModule {
  id?: number;
  collection_id: number;
  module_number: number;
  title: string;
  synopsis: string;
  release_year: number;
  duration: string; // formato HH:MM:SS
  education_cycle: string;
  poster_image?: File | string;
  video_url?: string;
  order_in_module: number;
  created_at?: string;
  updated_at?: string;
}

export interface CollectionWithVideos extends CollectionFormData {
  id: number;
  videos: VideoModule[];
  created_at: string;
  updated_at: string;
}

// Tipos para upload de arquivos
export interface FileUploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  message?: string;
}

export interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  currentImage?: string;
  label: string;
  accept?: string;
  maxSize?: number; // em MB
}

// Tipos para API responses
export interface CollectionsResponse {
  success: boolean;
  data: TVShowCollection[];
  message: string;
}

export interface CollectionResponse {
  success: boolean;
  data: TVShowCollection;
  message: string;
}

export interface CollectionSearchParams {
  q?: string;
  limit?: number;
  offset?: number;
}

// Enum para ciclos de ensino
export enum EducationCycle {
  INFANTIL = 'Educação Infantil',
  FUNDAMENTAL_I = 'Ensino Fundamental I',
  FUNDAMENTAL_II = 'Ensino Fundamental II',
  MEDIO = 'Ensino Médio',
  SUPERIOR = 'Ensino Superior',
  TECNICO = 'Ensino Técnico',
  EJA = 'Educação de Jovens e Adultos',
  LIVRE = 'Curso Livre'
}

// Enum para públicos-alvo
export enum TargetAudience {
  CRIANCAS = 'Crianças (0-12 anos)',
  ADOLESCENTES = 'Adolescentes (13-17 anos)',
  JOVENS = 'Jovens (18-25 anos)',
  ADULTOS = 'Adultos (26-59 anos)',
  IDOSOS = 'Idosos (60+ anos)',
  PROFESSORES = 'Professores',
  COORDENADORES = 'Coordenadores',
  GESTORES = 'Gestores Educacionais',
  PAIS = 'Pais e Responsáveis'
}

export interface CollectionsApiResponse {
  success: boolean;
  data: TVShowCollection[];
  message: string;
}

export interface SingleCollectionApiResponse {
  success: boolean;
  data: TVShowCollection;
  message: string;
}

export interface CollectionFilters {
  producer?: string;
  minRating?: number;
  maxRating?: number;
  dateFrom?: Date;
  dateTo?: Date;
} 