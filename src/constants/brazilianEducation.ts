export const BRAZILIAN_EDUCATION = {
  INFANTIL: {
    name: 'Educação Infantil',
    description: 'Primeiro contato com a escola, fase fundamental para o desenvolvimento global dos alunos',
    stages: {
      CRECHE: {
        name: 'Creche',
        ageRange: '0 a 3 anos',
        groups: [
          { name: 'Berçário', ageRange: '0 a 1 ano' },
          { name: 'Grupo 1', ageRange: '1 a 2 anos' },
          { name: 'Grupo 2', ageRange: '2 a 3 anos' },
          { name: 'Grupo 3', ageRange: '3 anos' }
        ]
      },
      PRE_ESCOLA: {
        name: 'Pré-escola',
        ageRange: '4 a 5 anos',
        groups: [
          { name: 'Grupo 4', ageRange: '4 anos' },
          { name: 'Grupo 5', ageRange: '5 anos' }
        ]
      }
    },
    developmentAreas: [
      'Cognitivo',
      'Físico',
      'Motor',
      'Psicológico',
      'Cultural',
      'Social'
    ]
  },
  FUNDAMENTAL: {
    name: 'Ensino Fundamental',
    description: 'Etapa que prepara o estudante para dominar a leitura, escrita e cálculo',
    duration: '9 anos',
    cycles: {
      ANOS_INICIAIS: {
        name: 'Anos Iniciais',
        description: 'Introdução escolar de conceitos educacionais básicos',
        grades: [
          { name: '1º Ano', age: 6, key: 'PRIMEIRO_ANO' },
          { name: '2º Ano', age: 7, key: 'SEGUNDO_ANO' },
          { name: '3º Ano', age: 8, key: 'TERCEIRO_ANO' },
          { name: '4º Ano', age: 9, key: 'QUARTO_ANO' },
          { name: '5º Ano', age: 10, key: 'QUINTO_ANO' }
        ]
      },
      ANOS_FINAIS: {
        name: 'Anos Finais',
        description: 'Aprofundamento de conhecimentos e desenvolvimento de independência',
        grades: [
          { name: '6º Ano', age: 11, key: 'SEXTO_ANO' },
          { name: '7º Ano', age: 12, key: 'SETIMO_ANO' },
          { name: '8º Ano', age: 13, key: 'OITAVO_ANO' },
          { name: '9º Ano', age: 14, key: 'NONO_ANO' }
        ]
      }
    }
  },
  MEDIO: {
    name: 'Ensino Médio',
    description: 'Etapa final da educação básica, preparação para universidade e mercado de trabalho',
    duration: '3 anos',
    grades: [
      { name: '1º Ano', age: 15, key: 'PRIMEIRO_ANO_EM' },
      { name: '2º Ano', age: 16, key: 'SEGUNDO_ANO_EM' },
      { name: '3º Ano', age: 17, key: 'TERCEIRO_ANO_EM' }
    ],
    areas: [
      'Linguagens e suas Tecnologias',
      'Matemática e suas Tecnologias',
      'Ciências da Natureza e suas Tecnologias',
      'Ciências Humanas e Sociais Aplicadas',
      'Formação Técnica e Profissional'
    ]
  }
} as const;

export const EDUCATIONAL_GUIDELINES = {
  INFANTIL: {
    objectives: [
      'Desenvolvimento de aspectos físicos, psicológicos, intelectuais e sociais',
      'Complemento da ação da família e da comunidade',
      'Desenvolvimento integral da criança'
    ],
    methodology: [
      'Atividades lúdicas',
      'Brincadeiras dirigidas',
      'Socialização',
      'Desenvolvimento motor',
      'Iniciação à linguagem'
    ]
  },
  FUNDAMENTAL: {
    objectives: [
      'Desenvolvimento da capacidade de aprender',
      'Domínio da leitura, escrita e cálculo',
      'Compreensão do ambiente natural e social',
      'Desenvolvimento da capacidade de aprendizagem',
      'Fortalecimento dos vínculos de família'
    ],
    methodology: [
      'Aulas expositivas',
      'Trabalhos em grupo',
      'Projetos interdisciplinares',
      'Avaliações continuadas',
      'Atividades práticas'
    ]
  },
  MEDIO: {
    objectives: [
      'Consolidação e aprofundamento dos conhecimentos do ensino fundamental',
      'Preparação básica para o trabalho',
      'Desenvolvimento da autonomia intelectual e pensamento crítico',
      'Compreensão dos fundamentos científico-tecnológicos'
    ],
    methodology: [
      'Aulas teóricas e práticas',
      'Laboratórios',
      'Projetos de pesquisa',
      'Preparação para vestibular',
      'Orientação profissional'
    ]
  }
} as const;

export const CORE_SUBJECTS = {
  FUNDAMENTAL_INICIAL: [
    'Língua Portuguesa',
    'Matemática',
    'Ciências',
    'História',
    'Geografia',
    'Artes',
    'Educação Física'
  ],
  FUNDAMENTAL_FINAL: [
    'Língua Portuguesa',
    'Matemática',
    'Ciências',
    'História',
    'Geografia',
    'Artes',
    'Educação Física',
    'Língua Estrangeira'
  ],
  MEDIO: [
    'Língua Portuguesa',
    'Matemática',
    'Física',
    'Química',
    'Biologia',
    'História',
    'Geografia',
    'Filosofia',
    'Sociologia',
    'Língua Estrangeira',
    'Educação Física',
    'Artes'
  ]
} as const;
