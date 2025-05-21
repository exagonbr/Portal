export const EDUCATION_LEVELS = {
  BASIC: 'BASIC',
  SUPERIOR: 'SUPERIOR',
  PROFESSIONAL: 'PROFESSIONAL',
  SPECIAL: 'SPECIAL'
} as const

export const BASIC_EDUCATION = {
  INFANTIL: {
    name: 'Educação Infantil',
    duration: '4 anos',
    ageRange: '0 a 3 anos',
    stages: ['Berçário', 'Maternal I', 'Maternal II', 'Maternal III']
  },
  PRE_SCHOOL: {
    name: 'Pré-escola',
    duration: '3 anos',
    ageRange: '4 a 6 anos',
    stages: ['Pré I', 'Pré II', 'Pré III']
  },
  FUNDAMENTAL: {
    name: 'Ensino Fundamental',
    duration: '9 anos',
    ageRange: '6 a 14 anos',
    stages: {
      INITIAL: {
        name: 'Anos Iniciais',
        years: ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano']
      },
      FINAL: {
        name: 'Anos Finais',
        years: ['6º ano', '7º ano', '8º ano', '9º ano']
      }
    }
  },
  MEDIO: {
    name: 'Ensino Médio',
    duration: '3 anos',
    ageRange: '15 a 17 anos',
    series: ['1º ano', '2º ano', '3º ano']
  },
  MEDIO_TECNICO: {
    name: 'Ensino Médio Técnico',
    duration: '1 a 3 anos',
    type: 'Contraturno',
    description: 'Cursos técnicos em períodos extraclasse'
  }
} as const

export const SPECIAL_EDUCATION = {
  name: 'Educação Especial',
  categories: {
    DEPENDENT: {
      name: 'Dependente',
      description: 'Alunos internados em hospitais ou clínicas devido ao estado de deficiência'
    },
    TRAINABLE: {
      name: 'Treinável',
      description: 'Alunos capazes de socialização sem ajuda'
    },
    EDUCABLE: {
      name: 'Educável',
      description: 'Alunos com vocabulário e habilidade de adaptação'
    }
  }
} as const

export const SUPERIOR_EDUCATION = {
  SEQUENTIAL: {
    name: 'Cursos Sequenciais',
    description: 'Mínimo de três disciplinas de graduação'
  },
  GRADUATION: {
    name: 'Graduação',
    types: {
      BACHELOR: {
        name: 'Bacharelado',
        description: 'Forma profissionais e pesquisadores para o mercado'
      },
      TEACHING: {
        name: 'Licenciatura',
        description: 'Forma professores para ensino fundamental e médio'
      },
      TECHNOLOGY: {
        name: 'Tecnólogo',
        description: 'Cursos com menor duração para áreas específicas'
      }
    }
  },
  POSTGRADUATE: {
    name: 'Pós-graduação',
    types: {
      MBA: {
        name: 'MBA (lato sensu)',
        description: 'Voltado para área gerencial e administrativa'
      },
      MASTERS: {
        name: 'Mestrado (stricto sensu)',
        duration: '2 anos',
        description: 'Focado em pesquisa com apresentação de tese'
      },
      DOCTORATE: {
        name: 'Doutorado (stricto sensu)',
        duration: '4 anos',
        description: 'Pesquisa aprofundada com tese'
      }
    }
  }
} as const

export const EDUCATION_INSTITUTIONS = {
  UNIVERSITY: {
    name: 'Universidade',
    characteristics: [
      'Instituições pluridisciplinares',
      'Autonomia para criar cursos',
      'Mínimo de 4 programas de pós-graduação stricto sensu',
      'Um terço do corpo docente em tempo integral',
      'Um terço dos docentes com mestrado/doutorado'
    ]
  },
  COLLEGE: {
    name: 'Faculdade',
    characteristics: [
      'Focada em área específica',
      'Necessita autorização do MEC para novos cursos',
      'Não tem autonomia para diplomas',
      'Um terço dos docentes com especialização'
    ]
  },
  UNIVERSITY_CENTER: {
    name: 'Centro Universitário',
    characteristics: [
      'Instituições pluricurriculares',
      'Autonomia para criar cursos',
      'Não precisa ter pesquisa institucionalizada',
      'Um terço dos docentes com mestrado/doutorado',
      'Um quinto em tempo integral'
    ]
  },
  TECH_CENTER: {
    name: 'Centro de Educação Tecnológica',
    characteristics: [
      'Especializado em educação profissional',
      'Foco em qualificação técnica',
      'Desenvolvimento de pesquisas tecnológicas'
    ]
  },
  FEDERAL_INSTITUTE: {
    name: 'Instituto Federal',
    characteristics: [
      'Instituições públicas',
      'Educação básica, superior e profissional',
      '50% vagas para ensino médio',
      '20% vagas para licenciaturas',
      'Autonomia para criar/extinguir cursos'
    ]
  }
} as const

export const EDUCATION_MODALITIES = {
  SPECIAL: {
    name: 'Educação Especial',
    description: 'Atende educandos com necessidades especiais'
  },
  DISTANCE: {
    name: 'Educação a Distância',
    description: 'Atende em tempos e espaços diversos via tecnologia'
  },
  PROFESSIONAL: {
    name: 'Educação Profissional e Tecnológica',
    description: 'Prepara para atividades produtivas e conhecimentos tecnológicos'
  },
  ADULT: {
    name: 'Educação de Jovens e Adultos',
    description: 'Atende pessoas sem acesso na idade apropriada'
  },
  INDIGENOUS: {
    name: 'Educação Indígena',
    description: 'Atende comunidades indígenas respeitando cultura e língua'
  }
} as const
