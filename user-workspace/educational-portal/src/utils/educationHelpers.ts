import { 
  BASIC_EDUCATION, 
  EDUCATION_LEVELS, 
  SPECIAL_EDUCATION,
  EDUCATION_MODALITIES 
} from '../constants/education'
import type { 
  Student, 
  EducationalStage, 
  Course,
  EducationalProgress,
  SpecialEducationReport 
} from '../types/education'

export function getAgeGroup(birthDate: Date): {
  level: string
  stage?: string
  cycle?: string
} {
  const age = calculateAge(birthDate)

  if (age >= 0 && age <= 3) {
    return { 
      level: EDUCATION_LEVELS.BASIC,
      stage: BASIC_EDUCATION.INFANTIL.name 
    }
  } else if (age >= 4 && age <= 6) {
    return { 
      level: EDUCATION_LEVELS.BASIC,
      stage: BASIC_EDUCATION.PRE_SCHOOL.name 
    }
  } else if (age >= 6 && age <= 14) {
    return { 
      level: EDUCATION_LEVELS.BASIC,
      stage: BASIC_EDUCATION.FUNDAMENTAL.name,
      cycle: age <= 10 ? 'Anos Iniciais' : 'Anos Finais'
    }
  } else if (age >= 15 && age <= 17) {
    return { 
      level: EDUCATION_LEVELS.BASIC,
      stage: BASIC_EDUCATION.MEDIO.name 
    }
  }

  return { level: EDUCATION_LEVELS.SUPERIOR }
}

export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export function isEligibleForEJA(student: Student): boolean {
  const age = calculateAge(new Date(student.birthDate))
  const { currentLevel, currentCycle } = student

  if (currentLevel === 'BASIC') {
    if (currentCycle === BASIC_EDUCATION.FUNDAMENTAL.name) {
      return age >= 15
    } else if (currentCycle === BASIC_EDUCATION.MEDIO.name) {
      return age >= 18
    }
  }

  return false
}

export function needsSpecialEducation(report: SpecialEducationReport): {
  category: keyof typeof SPECIAL_EDUCATION.categories
  recommendations: string[]
} {
  const { evaluation, accommodations } = report
  const recommendations: string[] = []

  // Analyze evaluation criteria
  if (evaluation.cognitive.includes('severe') || 
      evaluation.physical.includes('dependent')) {
    return {
      category: 'DEPENDENT',
      recommendations: [
        'Atendimento especializado individual',
        'Acompanhamento médico regular',
        'Adaptações específicas de material',
        ...accommodations.recommended
      ]
    }
  }

  if (evaluation.social.includes('adaptável') && 
      evaluation.cognitive.includes('moderado')) {
    return {
      category: 'TRAINABLE',
      recommendations: [
        'Atividades em grupo supervisionadas',
        'Material didático adaptado',
        ...accommodations.recommended
      ]
    }
  }

  return {
    category: 'EDUCABLE',
    recommendations: [
      'Acompanhamento regular',
      'Suporte adicional quando necessário',
      ...accommodations.recommended
    ]
  }
}

export function validateEducationalProgress(
  progress: EducationalProgress,
  course: Course
): { isValid: boolean; messages: string[] } {
  const messages: string[] = []
  let isValid = true

  // Validate attendance
  const attendanceRate = (progress.attendance.present / progress.attendance.total) * 100
  if (attendanceRate < 75) {
    messages.push('Frequência abaixo do mínimo exigido de 75%')
    isValid = false
  }

  // Validate grades
  const finalGrade = calculateFinalGrade(progress.grades)
  if (finalGrade < 6) {
    messages.push('Nota final abaixo da média mínima de 6,0')
    isValid = false
  }

  // Validate progress
  if (progress.progress < 100 && 
      new Date(course.schedule.endDate) < new Date()) {
    messages.push('Conteúdo programático não concluído no prazo')
    isValid = false
  }

  return { isValid, messages }
}

export function calculateFinalGrade(grades: EducationalProgress['grades']): number {
  const weights = {
    assignments: 0.2,
    tests: 0.4,
    projects: 0.3,
    participation: 0.1
  }

  return (
    grades.assignments * weights.assignments +
    grades.tests * weights.tests +
    grades.projects * weights.projects +
    grades.participation * weights.participation
  )
}

export function getNextEducationalStage(
  currentStage: EducationalStage,
  specialNeeds?: Student['specialNeeds']
): {
  nextStage: EducationalStage
  requirements: string[]
  accommodations?: string[]
} {
  // Implementation would depend on the complete educational progression rules
  // This is a placeholder that would need to be completed based on specific requirements
  return {
    nextStage: {
      id: 'next-stage-id',
      name: 'Next Stage Name',
      description: 'Next stage description'
    },
    requirements: [
      'Minimum attendance met',
      'Passing grades in all subjects',
      'Required evaluations completed'
    ],
    accommodations: specialNeeds ? [
      'Adapted materials',
      'Additional support time',
      'Modified evaluation methods'
    ] : undefined
  }
}

export function isEligibleForModality(
  student: Student,
  modality: keyof typeof EDUCATION_MODALITIES
): boolean {
  switch (modality) {
    case 'SPECIAL':
      return !!student.specialNeeds
    
    case 'DISTANCE':
      return calculateAge(new Date(student.birthDate)) >= 18
    
    case 'PROFESSIONAL':
      return student.currentLevel === 'BASIC' &&
             student.currentCycle === BASIC_EDUCATION.MEDIO.name
    
    case 'ADULT':
      return isEligibleForEJA(student)
    
    case 'INDIGENOUS':
      // Would need specific criteria for indigenous education eligibility
      return false
    
    default:
      return false
  }
}
