import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('forum_replies').del();
  await knex('forum_threads').del();
  await knex('chat_messages').del();
  await knex('chats').del();
  await knex('highlights').del();
  await knex('annotations').del();

  // Get user IDs
  const users = await knex('users').select('id', 'email');
  const getUserId = (email: string) => users.find(u => u.email === email)?.id;

  // Get book IDs
  const books = await knex('books').select('id', 'title');
  const getBookId = (title: string) => books.find(b => b.title === title)?.id;

  // Get course IDs
  const courses = await knex('courses').select('id', 'name');
  const getCourseId = (name: string) => courses.find(c => c.name === name)?.id;

  // Insert annotations
  const annotations = [
    {
      content: 'Importante conceito sobre metodologia científica que precisa ser revisado.',
      page_number: 15,
      book_id: getBookId('Matemática Avançada - Volume 1'),
      user_id: getUserId('julia.c@edu.com'),
      position: JSON.stringify({ x: 150, y: 200 })
    },
    {
      content: 'Definição fundamental para o entendimento do capítulo.',
      page_number: 28,
      book_id: getBookId('Matemática Avançada - Volume 1'),
      user_id: getUserId('julia.c@edu.com'),
      position: JSON.stringify({ x: 180, y: 350 })
    },
    {
      content: 'Referência importante para a bibliografia.',
      page_number: 42,
      book_id: getBookId('História do Brasil Colonial'),
      user_id: getUserId('pedro.s@edu.com'),
      position: JSON.stringify({ x: 200, y: 150 })
    },
    {
      content: 'Exemplo prático de aplicação da teoria.',
      page_number: 67,
      book_id: getBookId('Python para Iniciantes'),
      user_id: getUserId('carlos.m@edu.com'),
      position: JSON.stringify({ x: 250, y: 400 })
    },
    {
      content: 'Conclusão relevante para o trabalho final.',
      page_number: 89,
      book_id: getBookId('Python para Iniciantes'),
      user_id: getUserId('carlos.m@edu.com'),
      position: JSON.stringify({ x: 300, y: 280 })
    }
  ].filter(ann => ann.book_id && ann.user_id);

  await knex('annotations').insert(annotations);

  // Insert highlights
  const highlights = [
    {
      content: 'A metodologia científica requer um processo sistemático de investigação e documentação dos resultados obtidos.',
      page_number: 15,
      color: '#FFEB3B',
      book_id: getBookId('Matemática Avançada - Volume 1'),
      user_id: getUserId('julia.c@edu.com'),
      position: JSON.stringify({ x: 150, y: 200, width: 400, height: 24 })
    },
    {
      content: 'Os resultados demonstram uma correlação significativa entre as variáveis estudadas, sugerindo uma forte relação causal.',
      page_number: 28,
      color: '#4CAF50',
      book_id: getBookId('Matemática Avançada - Volume 1'),
      user_id: getUserId('julia.c@edu.com'),
      position: JSON.stringify({ x: 180, y: 350, width: 380, height: 48 })
    },
    {
      content: 'Os princípios fundamentais da teoria podem ser resumidos em três aspectos principais que se interrelacionam.',
      page_number: 42,
      color: '#2196F3',
      book_id: getBookId('História do Brasil Colonial'),
      user_id: getUserId('pedro.s@edu.com'),
      position: JSON.stringify({ x: 200, y: 150, width: 420, height: 24 })
    },
    {
      content: 'A aplicação prática destes conceitos demonstra a versatilidade da metodologia em diferentes contextos.',
      page_number: 67,
      color: '#FFEB3B',
      book_id: getBookId('Python para Iniciantes'),
      user_id: getUserId('carlos.m@edu.com'),
      position: JSON.stringify({ x: 250, y: 400, width: 390, height: 24 })
    }
  ].filter(hl => hl.book_id && hl.user_id);

  await knex('highlights').insert(highlights);

  // Insert chats
  const chats = [
    {
      name: 'Matemática - 9º Ano A',
      course_id: getCourseId('Matemática Avançada'),
      participants: ['t1', 's1', 's2'],
      last_message: 'Boa tarde, turma!',
      last_message_time: new Date('2024-01-20T14:30:00Z')
    },
    {
      name: 'Física - 9º Ano B',
      course_id: getCourseId('Matemática Avançada'),
      participants: ['t1', 's2'],
      last_message: 'Dúvida sobre a experiência',
      last_message_time: new Date('2024-01-20T15:45:00Z')
    }
  ].filter(chat => chat.course_id);

  const insertedChats = await knex('chats').insert(chats).returning('*');

  // Insert chat messages
  const chatMessages = [
    {
      chat_id: insertedChats[0].id,
      sender_id: getUserId('ricardo.oliveira@edu.com'),
      content: 'Boa tarde, turma! Como estão os estudos?',
      read_by: ['t1', 's1', 's2']
    },
    {
      chat_id: insertedChats[0].id,
      sender_id: getUserId('julia.c@edu.com'),
      content: 'Boa tarde, professor! Estou com uma dúvida sobre a matéria de hoje.',
      read_by: ['t1', 's1']
    },
    {
      chat_id: insertedChats[0].id,
      sender_id: getUserId('ricardo.oliveira@edu.com'),
      content: 'Claro! Qual é a sua dúvida?',
      read_by: ['t1', 's1']
    },
    {
      chat_id: insertedChats[0].id,
      sender_id: getUserId('julia.c@edu.com'),
      content: 'É sobre as equações do segundo grau. Não entendi como resolver quando o discriminante é negativo.',
      read_by: ['t1', 's1']
    },
    {
      chat_id: insertedChats[0].id,
      sender_id: getUserId('ricardo.oliveira@edu.com'),
      content: 'Ótima pergunta! Quando o discriminante (Δ) é negativo, a equação não possui raízes reais. Isso significa que o gráfico da função não toca o eixo x.',
      read_by: ['t1', 's1']
    }
  ].filter(msg => msg.sender_id);

  await knex('chat_messages').insert(chatMessages);

  // Insert forum threads
  const forumThreads = [
    {
      course_id: getCourseId('Matemática Avançada'),
      title: 'Dúvidas sobre Equações Quadráticas',
      content: 'Estou com dificuldades para resolver equações do segundo grau. Alguém pode me ajudar?',
      author_id: getUserId('julia.c@edu.com'),
      tags: ['Question', 'Technical'],
      pinned: false,
      locked: false,
      views: 25
    },
    {
      course_id: getCourseId('História do Brasil Colônia'),
      title: 'Experimento de Física - Resultados',
      content: 'Compartilhando os resultados do experimento sobre movimento retilíneo uniforme.',
      author_id: getUserId('ricardo.oliveira@edu.com'),
      tags: ['Resource', 'Assignment'],
      pinned: true,
      locked: false,
      views: 45
    }
  ].filter(thread => thread.course_id && thread.author_id);

  await knex('forum_threads').insert(forumThreads);
}
