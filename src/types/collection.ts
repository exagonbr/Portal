export interface Module {
  id: string;
  name: string;
  description: string;
  coverImage: string; // URL do S3
  videoIds: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  name: string;
  moduleId: string;
  videoUrl: string; // URL do S3
  duration: number; // em segundos
  authors: string[];
  educationCycle: {
    level: keyof typeof import('../constants/brazilianEducation').BRAZILIAN_EDUCATION;
    cycle?: string; // Para Fundamental: 'ANOS_INICIAIS' ou 'ANOS_FINAIS'
    grade?: string; // Chave da série específica
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  synopsis: string;
  coverImage: string;
  supportMaterial?: string; // URL do PDF (S3)
  totalDuration: number; // em segundos
  subject: string; // disciplina
  modules: Module[];
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookByEducationCycle {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear: number;
  description: string;
  thumbnail: string;
  url: string;
  s3Key?: string;
  size: number;
  educationLevel: keyof typeof import('../constants/brazilianEducation').BRAZILIAN_EDUCATION;
  cycle?: string; // Para Fundamental: 'ANOS_INICIAIS' ou 'ANOS_FINAIS'
  grade?: string; // Chave da série específica
  subject?: string; // Disciplina do livro
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
}