export interface Module {
  id: string;
  name: string;
  description: string;
  coverImage: string; // S3 URL
  videoIds: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  name: string;
  moduleId: string;
  videoUrl: string; // S3 URL
  duration: number; // in seconds
  authors: string[];
  educationCycle: {
    level: keyof typeof import('../constants/brazilianEducation').BRAZILIAN_EDUCATION;
    cycle?: string; // For Fundamental: 'ANOS_INICIAIS' or 'ANOS_FINAIS'
    grade?: string; // Specific grade key
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  synopsis: string;
  coverImage: string;
  supportMaterial?: string; // PDF URL (S3)
  totalDuration: number; // in seconds
  subject: string; // discipline
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
  cycle?: string; // For Fundamental: 'ANOS_INICIAIS' or 'ANOS_FINAIS'
  grade?: string; // Specific grade key
  subject?: string; // Subject of the book
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
}