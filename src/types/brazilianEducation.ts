export interface EducationalGroup {
  name: string;
  ageRange: string;
}

export interface EducationalStage {
  name: string;
  ageRange: string;
  groups: EducationalGroup[];
}

export interface FundamentalGrade {
  name: string;
  age: number;
  key: string;
}

export interface FundamentalCycle {
  name: string;
  description: string;
  grades: FundamentalGrade[];
}

export interface MedioGrade {
  name: string;
  age: number;
  key: string;
}

// Interfaces for the Brazilian Education System
export interface InfantilEducation {
  name: string;
  description: string;
  stages: {
    CRECHE: EducationalStage;
    PRE_ESCOLA: EducationalStage;
  };
  developmentAreas: string[];
}

export interface FundamentalEducation {
  name: string;
  description: string;
  duration: string;
  cycles: {
    ANOS_INICIAIS: FundamentalCycle;
    ANOS_FINAIS: FundamentalCycle;
  };
}

export interface MedioEducation {
  name: string;
  description: string;
  duration: string;
  grades: MedioGrade[];
  areas: string[];
}

// Interfaces for Educational Guidelines
export interface EducationalGuideline {
  objectives: string[];
  methodology: string[];
}

// Interfaces for Lesson Planning
export interface LessonPlan {
  id: string;
  teacherId: string;
  courseId: string;
  educationalLevel: keyof typeof import('../constants/brazilianEducation').BRAZILIAN_EDUCATION;
  grade?: string;
  subject: string;
  unit: {
    number: number;
    title: string;
    description: string;
  };
  objectives: string[];
  content: {
    topics: string[];
    activities: string[];
    resources: string[];
  };
  methodology: string[];
  evaluation: {
    criteria: string[];
    instruments: string[];
    weight: number;
  }[];
  schedule: {
    startDate: string;
    endDate: string;
    totalHours: number;
    weeklyHours: number;
  };
  additionalResources?: {
    type: 'document' | 'video' | 'link' | 'other';
    title: string;
    url: string;
    description?: string;
  }[];
}

// Interface for Student Academic Record
export interface StudentAcademicRecord {
  studentId: string;
  currentEducationLevel: keyof typeof import('../constants/brazilianEducation').BRAZILIAN_EDUCATION;
  grade: string;
  academicYear: string;
  subjects: {
    name: string;
    teacher: string;
    grades: {
      term: number;
      evaluations: {
        type: string;
        weight: number;
        grade: number;
      }[];
      average: number;
    }[];
    finalGrade: number;
    attendance: {
      totalClasses: number;
      presences: number;
      absences: number;
      percentage: number;
    };
    status: 'approved' | 'failed' | 'in_progress';
  }[];
  observations?: string[];
}

// Interface for Class/Turma
export interface ClassGroup {
  id: string;
  name: string;
  educationalLevel: keyof typeof import('../constants/brazilianEducation').BRAZILIAN_EDUCATION;
  grade: string;
  academicYear: string;
  shift: 'morning' | 'afternoon' | 'evening';
  teachers: {
    teacherId: string;
    subjects: string[];
  }[];
  students: string[];
  schedule: {
    dayOfWeek: string;
    subjects: {
      time: string;
      subject: string;
      teacherId: string;
    }[];
  }[];
  capacity: {
    total: number;
    enrolled: number;
  };
}
