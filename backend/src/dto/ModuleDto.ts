// Supondo que LessonDto e QuizDto serão criados ou já existem para popular 'lessons' e 'quizzes'
// import { LessonDto } from './LessonDto'; 
// import { QuizDto } from './QuizDto';

export interface ModuleDto {
  id: string;
  name: string;
  description?: string;
  order: number;
  xp_reward: number;
  is_completed: boolean; // Este campo pode ser específico do usuário/contexto, não do módulo em si
  prerequisites?: string[]; // IDs de outros módulos
  course_id: string;
  // lessons?: LessonDto[]; // Se for incluir aulas no DTO do módulo
  // quizzes?: QuizDto[];   // Se for incluir quizzes no DTO do módulo
  created_at: Date;
  updated_at: Date;
}

export interface CreateModuleDto {
  name: string;
  description?: string;
  order: number;
  xp_reward?: number;
  // is_completed não deve ser definido na criação, geralmente
  prerequisites?: string[];
  course_id: string;
}

export interface UpdateModuleDto {
  name?: string;
  description?: string;
  order?: number;
  xp_reward?: number;
  // is_completed geralmente é atualizado por outra lógica (progresso do aluno)
  prerequisites?: string[];
  course_id?: string; // Permitir mover módulo para outro curso? Geralmente não.
}