export interface EducationalStage {
  id: string
  name: string
  description?: string
  duration?: string
  ageRange?: string
}

export interface EducationalCycle {
  id: string
  name: string
  stages: EducationalStage[]
  description?: string
}

export interface EducationalLevel {
  id: string
  name: string
  cycles: EducationalCycle[]
  description?: string
}

export interface EducationalInstitution {
  id: string
  name: string
  type: keyof typeof import('../constants/education').EDUCATION_INSTITUTIONS
  characteristics: string[]
}

export interface EducationalModality {
  id: string
  name: string
  description: string
  applicableLevels: Array<keyof typeof import('../constants/education').EDUCATION_LEVELS>
}

export interface Student {
  id: string
  name: string
  birthDate: string
  currentLevel: keyof typeof import('../constants/education').EDUCATION_LEVELS
  currentCycle: string
  currentStage: string
  specialNeeds?: {
    category: keyof typeof import('../constants/education').SPECIAL_EDUCATION.categories
    description: string
  }
}

export interface Course {
  id: string
  name: string
  description: string
  level: keyof typeof import('../constants/education').EDUCATION_LEVELS
  cycle?: string
  stage?: string
  modality?: keyof typeof import('../constants/education').EDUCATION_MODALITIES
  institution: EducationalInstitution
  duration: string
  schedule: {
    startDate: string
    endDate: string
    classDays: string[]
    classTime: string
  }
}

export interface Class {
  id: string
  courseId: string
  name: string
  teacher: string
  students: Student[]
  schedule: {
    day: string
    time: string
    duration: string
  }
  room?: string
  isOnline?: boolean
  meetingUrl?: string
}

export interface EducationalProgress {
  studentId: string
  courseId: string
  stageId: string
  progress: number
  grades: {
    assignments: number
    tests: number
    projects: number
    participation: number
    final: number
  }
  attendance: {
    total: number
    present: number
    absent: number
    justified: number
  }
  specialAccommodations?: {
    type: string
    description: string
    requirements: string[]
  }
}

export interface EducationalPlan {
  studentId: string
  academicYear: string
  goals: {
    short: string[]
    medium: string[]
    long: string[]
  }
  accommodations?: {
    type: string
    description: string
    resources: string[]
  }[]
  evaluations: {
    date: string
    type: string
    result: string
    observations: string
  }[]
  recommendations: string[]
}

export interface TeachingPlan {
  courseId: string
  teacherId: string
  objectives: string[]
  content: {
    unit: string
    topics: string[]
    duration: string
  }[]
  methodology: string[]
  resources: string[]
  evaluation: {
    criteria: string[]
    instruments: string[]
    weights: Record<string, number>
  }
  bibliography: {
    required: string[]
    supplementary: string[]
  }
}

export interface SpecialEducationReport {
  studentId: string
  date: string
  category: keyof typeof import('../constants/education').SPECIAL_EDUCATION.categories
  evaluation: {
    cognitive: string
    social: string
    physical: string
    emotional: string
  }
  accommodations: {
    current: string[]
    recommended: string[]
  }
  progress: {
    achievements: string[]
    challenges: string[]
    nextSteps: string[]
  }
  support: {
    inClass: string[]
    external: string[]
    family: string[]
  }
  professionals: {
    name: string
    role: string
    observations: string
  }[]
}
