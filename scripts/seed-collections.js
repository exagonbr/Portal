const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleCollections = [
  {
    name: "A Dinâmica do World Café",
    overview: "Uma metodologia inovadora para facilitar conversas significativas e colaboração em grupos grandes. Aprenda como criar um ambiente acolhedor que promove o diálogo criativo e a inteligência coletiva.",
    poster_path: "world-cafe-poster.jpg",
    backdrop_path: "world-cafe-backdrop.jpg",
    first_air_date: new Date('2024-01-15'),
    popularity: 8.5,
    vote_average: 9.2,
    vote_count: 156,
    producer: "Instituto de Educação Colaborativa",
    total_load: "4 horas",
    manual_support_path: "manuais/world-cafe-manual.pdf",
    contract_term_end: new Date('2025-12-31')
  },
  {
    name: "Metodologias Ativas na Educação",
    overview: "Explore técnicas pedagógicas que colocam o estudante no centro do processo de aprendizagem. Descubra como implementar aprendizagem baseada em problemas, sala de aula invertida e outras metodologias.",
    poster_path: "metodologias-ativas-poster.jpg",
    backdrop_path: "metodologias-ativas-backdrop.jpg",
    first_air_date: new Date('2024-02-20'),
    popularity: 9.1,
    vote_average: 8.8,
    vote_count: 203,
    producer: "Centro de Inovação Pedagógica",
    total_load: "6 horas",
    manual_support_path: "manuais/metodologias-ativas-manual.pdf",
    contract_term_end: new Date('2025-12-31')
  },
  {
    name: "Design Thinking para Educadores",
    overview: "Aprenda a aplicar o pensamento de design na educação para criar experiências de aprendizagem mais envolventes e eficazes. Desenvolva soluções inovadoras para desafios educacionais.",
    poster_path: "design-thinking-poster.jpg",
    backdrop_path: "design-thinking-backdrop.jpg",
    first_air_date: new Date('2024-03-10'),
    popularity: 7.8,
    vote_average: 8.5,
    vote_count: 89,
    producer: "Escola de Design Educacional",
    total_load: "5 horas",
    manual_support_path: "manuais/design-thinking-manual.pdf",
    contract_term_end: new Date('2025-12-31')
  },
  {
    name: "Gamificação na Sala de Aula",
    overview: "Descubra como usar elementos de jogos para motivar estudantes e tornar o aprendizado mais divertido e engajador. Aprenda a criar sistemas de recompensas e desafios educacionais.",
    poster_path: "gamificacao-poster.jpg",
    backdrop_path: "gamificacao-backdrop.jpg",
    first_air_date: new Date('2024-04-05'),
    popularity: 8.9,
    vote_average: 9.0,
    vote_count: 167,
    producer: "GameEdu Solutions",
    total_load: "3 horas",
    manual_support_path: "manuais/gamificacao-manual.pdf",
    contract_term_end: new Date('2025-12-31')
  },
  {
    name: "Tecnologia Educacional Avançada",
    overview: "Explore as mais recentes tecnologias aplicadas à educação, incluindo realidade virtual, inteligência artificial e plataformas de aprendizagem adaptativa.",
    poster_path: "tech-educacional-poster.jpg",
    backdrop_path: "tech-educacional-backdrop.jpg",
    first_air_date: new Date('2024-05-12'),
    popularity: 7.2,
    vote_average: 8.1,
    vote_count: 134,
    producer: "TechEdu Innovation Lab",
    total_load: "8 horas",
    manual_support_path: "manuais/tech-educacional-manual.pdf",
    contract_term_end: new Date('2025-12-31')
  },
  {
    name: "Avaliação Formativa e Feedback",
    overview: "Aprenda técnicas eficazes de avaliação contínua e como fornecer feedback construtivo que promova o crescimento dos estudantes.",
    poster_path: "avaliacao-formativa-poster.jpg",
    backdrop_path: "avaliacao-formativa-backdrop.jpg",
    first_air_date: new Date('2024-06-18'),
    popularity: 6.8,
    vote_average: 7.9,
    vote_count: 98,
    producer: "Instituto de Avaliação Educacional",
    total_load: "4 horas",
    manual_support_path: "manuais/avaliacao-formativa-manual.pdf",
    contract_term_end: new Date('2025-12-31')
  }
];

async function seedCollections() {
  try {
    console.log('Iniciando seed das coleções...');
    
    // Limpar dados existentes
    await prisma.tVShow.deleteMany();
    console.log('Dados existentes removidos.');
    
    // Inserir novos dados
    for (const collection of sampleCollections) {
      await prisma.tVShow.create({
        data: collection
      });
      console.log(`Coleção "${collection.name}" criada.`);
    }
    
    console.log('Seed concluído com sucesso!');
    console.log(`${sampleCollections.length} coleções foram criadas.`);
    
  } catch (error) {
    console.error('Erro durante o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCollections();