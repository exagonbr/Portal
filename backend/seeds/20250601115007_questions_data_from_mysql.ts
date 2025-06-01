/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: question -> questions
 * Gerado em: 2025-06-01T11:50:07.818Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('questions').del();

  // Insere dados de exemplo do MySQL
  await knex('questions').insert([
    {
        "id": 6,
        "file_id": 963,
        "test": "Como as ideias pedagógicas foram introduzidas no Brasil?",
        "tv_show_id": 55,
        "episode_id": 298
    },
    {
        "id": 7,
        "file_id": 963,
        "test": "Qual era o objetivo principal da Educação promovida pelos jesuítas no Brasil colonial?",
        "tv_show_id": 55,
        "episode_id": 298
    },
    {
        "id": 8,
        "file_id": 968,
        "test": "Qual foi a consequência da expulsão dos jesuítas e a criação das Aulas Régias em Portugal e no Brasil?",
        "tv_show_id": 55,
        "episode_id": 299
    },
    {
        "id": 9,
        "file_id": 968,
        "test": "Como as escolas modernas ou racionalistas no Brasil foram caracterizadas?",
        "tv_show_id": 55,
        "episode_id": 299
    },
    {
        "id": 10,
        "file_id": 965,
        "test": "Qual foi o principal objetivo do Manifesto dos Pioneiros da Educação Nova?",
        "tv_show_id": 55,
        "episode_id": 300
    },
    {
        "id": 11,
        "file_id": 965,
        "test": "Como o governo de Getúlio Vargas equilibrou as forças entre católicos e renovadores na área da educação?",
        "tv_show_id": 55,
        "episode_id": 300
    },
    {
        "id": 12,
        "file_id": 967,
        "test": "Qual foi o impacto da predominância da Pedagogia tecnicista na década de 1970 no cenário educacional brasileiro?",
        "tv_show_id": 55,
        "episode_id": 301
    },
    {
        "id": 13,
        "file_id": 967,
        "test": "Como as ideias pedagógicas contra-hegemônicas na década de 1980 buscaram transformar o cenário educacional brasileiro?",
        "tv_show_id": 55,
        "episode_id": 301
    },
    {
        "id": 14,
        "file_id": 1463,
        "test": "Como a transição da tradição oral para a escrita durante o Império Romano influenciou o desenvolvimento educacional, considerando a mudança de status dos professores ex-escravizados e a importância atribuída aos trabalhos manuais?",
        "tv_show_id": 55,
        "episode_id": 302
    },
    {
        "id": 16,
        "file_id": 1463,
        "test": "Qual foi o impacto da ascensão da burguesia na educação durante o final da Idade Média, considerando a busca por alinhar os fazeres intelectual e prático, exemplificado pela ênfase no ensino de Matemática para fins comerciais, e o rompimento com os valores aristocratas e a influência da fé católica?",
        "tv_show_id": 55,
        "episode_id": 302
    },
    {
        "id": 19,
        "file_id": 547,
        "test": "Qual o impacto da desregulamentação na educação brasileira?",
        "tv_show_id": 35,
        "episode_id": 154
    },
    {
        "id": 20,
        "file_id": 547,
        "test": "Como a falta de rigor na escolha de práticas pedagógicas afeta a qualidade do ensino?",
        "tv_show_id": 35,
        "episode_id": 154
    },
    {
        "id": 21,
        "file_id": 545,
        "test": "Qual o papel da autoridade na relação entre professores e alunos?",
        "tv_show_id": 35,
        "episode_id": 155
    },
    {
        "id": 22,
        "file_id": 545,
        "test": "Como o texto aborda a formação do professor ideal?",
        "tv_show_id": 35,
        "episode_id": 155
    },
    {
        "id": 23,
        "file_id": 548,
        "test": "Qual o impacto da responsabilização dos alunos pelo insucesso escolar, conforme discutido no texto?",
        "tv_show_id": 35,
        "episode_id": 156
    },
    {
        "id": 24,
        "file_id": 548,
        "test": "Por que os professores devem evitar assumir o papel de psicólogos na escola?",
        "tv_show_id": 35,
        "episode_id": 156
    },
    {
        "id": 25,
        "file_id": 546,
        "test": "Como a sala de aula é descrita no texto em relação ao seu papel como espaço público?",
        "tv_show_id": 35,
        "episode_id": 157
    },
    {
        "id": 26,
        "file_id": 546,
        "test": "Qual o papel do professor na inversão do foco da escola como local de diagnóstico de problemas para soluções pedagógicas?",
        "tv_show_id": 35,
        "episode_id": 157
    },
    {
        "id": 27,
        "file_id": 1363,
        "test": "A metodologia World Café foi criada por Juanita Brown e David Isaacs em 1995 nos Estados Unidos. Qual é o objetivo da metodologia World Café?",
        "tv_show_id": 79,
        "episode_id": 527
    },
    {
        "id": 28,
        "file_id": 1363,
        "test": "No World Café, os participantes são organizados em grupos para conversar sobre um tema em rodadas com tempo determinado. Depois, os grupos são redefinidos para que os diálogos sejam ampliados. Nesse sentido, assinale a alternativa correta.",
        "tv_show_id": 79,
        "episode_id": 527
    },
    {
        "id": 29,
        "file_id": 1364,
        "test": "A metodologia World Café se baseia no diálogo e na diversidade de conhecimentos que são compartilhados e valorizados. Considerando as diretrizes da BNCC, a metodologia World Café tem como objetivo promover a:",
        "tv_show_id": 79,
        "episode_id": 528
    },
    {
        "id": 30,
        "file_id": 1364,
        "test": "O World Café busca promover a participação dos alunos por meio de diálogos intencionais, favorecendo a troca de ideias entre os envolvidos. Assinale a alternativa correta em relação a essa metodologia.",
        "tv_show_id": 79,
        "episode_id": 528
    },
    {
        "id": 31,
        "file_id": 1366,
        "test": "Para promover espaços de diálogos e interações, a metodologia World Café pode transformar diferentes cenários em ambientes de aprendizagem extremamente ricos. Assinale a alternativa correta.",
        "tv_show_id": 79,
        "episode_id": 529
    },
    {
        "id": 32,
        "file_id": 1366,
        "test": "No World Café, os ambientes devem promover o aprendizado significativo de forma segura e eficiente. Qual é a importância dos ambientes de aprendizagem nessa metodologia?",
        "tv_show_id": 79,
        "episode_id": 529
    },
    {
        "id": 33,
        "file_id": 1365,
        "test": "Quando uma pessoa consegue compreender algo ou encontrar a solução de um problema de forma súbita, como se uma lâmpada iluminasse seus pensamentos, trata-se de:",
        "tv_show_id": 79,
        "episode_id": 530
    },
    {
        "id": 34,
        "file_id": 1365,
        "test": "O World Café potencializa o uso da palavra e a troca de saberes de forma coletiva. Com a finalidade de motivar a participação e os insights dos alunos, o World Café tem como princípio:",
        "tv_show_id": 79,
        "episode_id": 530
    },
    {
        "id": 35,
        "file_id": 1367,
        "test": "Na metodologia do World Café, a definição de um contexto ou de uma temática é fundamental para despertar o interesse dos estudantes. Nesse sentido, assinale a alternativa correta.",
        "tv_show_id": 79,
        "episode_id": 531
    },
    {
        "id": 36,
        "file_id": 1367,
        "test": "O professor deve ouvir os insights, valorizar a diversidade de ideias e estimular o pensamento dos participantes. Outro ponto importante é o compartilhamento das descobertas coletivas. Qual outra ação faz parte do World Café?",
        "tv_show_id": 79,
        "episode_id": 531
    },
    {
        "id": 37,
        "file_id": 1391,
        "test": "Qual é a principal ideia defendida por Howard Gardner em sua teoria das Inteligências Múltiplas?",
        "tv_show_id": 73,
        "episode_id": 484
    },
    {
        "id": 38,
        "file_id": 1391,
        "test": "Segundo as teorias cognitivas apresentadas, qual é a implicação das competências intelectuais ou habilidades distintas para cada área de atuação?",
        "tv_show_id": 73,
        "episode_id": 484
    },
    {
        "id": 39,
        "file_id": 1389,
        "test": "Segundo as teorias cognitivas apresentadas, qual é a implicação das competências intelectuais ou habilidades distintas para cada área de atuação?",
        "tv_show_id": 73,
        "episode_id": 485
    },
    {
        "id": 40,
        "file_id": 1389,
        "test": "Qual é o principal objetivo da atividade que envolve a nuvem de palavras?",
        "tv_show_id": 73,
        "episode_id": 485
    },
    {
        "id": 41,
        "file_id": 1390,
        "test": "Qual é o principal objetivo da atividade relacionada à inteligência lógico-matemática?",
        "tv_show_id": 73,
        "episode_id": 486
    },
    {
        "id": 42,
        "file_id": 1390,
        "test": "Por que a atividade de caça-palavras adaptada para a revisão de conteúdo em língua estrangeira é considerada marcante?",
        "tv_show_id": 73,
        "episode_id": 486
    },
    {
        "id": 43,
        "file_id": 1392,
        "test": "Qual é a principal finalidade da atividade de explorar mapas relacionada à inteligência espacial-visual?",
        "tv_show_id": 73,
        "episode_id": 487
    },
    {
        "id": 44,
        "file_id": 1392,
        "test": "De que maneira o uso de mapas na atividade contribui para a interdisciplinaridade e o conhecimento dos alunos sobre lugares típicos e culturais?",
        "tv_show_id": 73,
        "episode_id": 487
    },
    {
        "id": 45,
        "file_id": 1438,
        "test": "Qual é um dos objetivos do uso de atividades musicais no ensino de línguas, especialmente no que diz respeito à inteligência musical?",
        "tv_show_id": 73,
        "episode_id": 488
    },
    {
        "id": 46,
        "file_id": 1438,
        "test": "Como a atividade musical no contexto do ensino de línguas favorece a interação social?",
        "tv_show_id": 73,
        "episode_id": 488
    },
    {
        "id": 47,
        "file_id": 1394,
        "test": "Aponte um dos propósitos da prática de atividades físicas de acordo com a inteligência corporal-sinestésica?",
        "tv_show_id": 73,
        "episode_id": 489
    },
    {
        "id": 48,
        "file_id": 1394,
        "test": "Como a conexão entre atletas brasileiros e internacionais pode beneficiar o desenvolvimento dos alunos na sala de aula?",
        "tv_show_id": 73,
        "episode_id": 489
    },
    {
        "id": 49,
        "file_id": 1395,
        "test": "Qual é o papel fundamental da interação social na inteligência interpessoal?",
        "tv_show_id": 73,
        "episode_id": 490
    },
    {
        "id": 50,
        "file_id": 1395,
        "test": "Como a atividade que incentiva os alunos à prática do voluntariado pode contribuir para o desenvolvimento interpessoal?",
        "tv_show_id": 73,
        "episode_id": 490
    },
    {
        "id": 51,
        "file_id": 1396,
        "test": "Qual é a finalidade da atividade de escrita literária de acordo com a inteligência intrapessoal?",
        "tv_show_id": 73,
        "episode_id": 491
    },
    {
        "id": 52,
        "file_id": 1396,
        "test": "Considerando a inteligência intrapessoal e a importância afetiva, como a apresentação da atividade de escrita literária pode ser benéfica?",
        "tv_show_id": 73,
        "episode_id": 491
    },
    {
        "id": 53,
        "file_id": 1397,
        "test": "Como as atividades relacionadas à inteligência naturalista podem contribuir para a construção do indivíduo?",
        "tv_show_id": 73,
        "episode_id": 492
    },
    {
        "id": 54,
        "file_id": 1397,
        "test": "Qual é a proposta da inteligência naturalista?",
        "tv_show_id": 73,
        "episode_id": 492
    },
    {
        "id": 55,
        "file_id": 1398,
        "test": "Qual é o público-alvo da proposta pedagógica sobre o uso do lúdico no ensino da língua inglesa?",
        "tv_show_id": 73,
        "episode_id": 493
    },
    {
        "id": 56,
        "file_id": 1398,
        "test": "Assinale a alternativa que enfatiza a importância do lúdico no planejamento do ensino da língua inglesa.",
        "tv_show_id": 73,
        "episode_id": 493
    },
    {
        "id": 57,
        "file_id": 1198,
        "test": "A tese chamada Pedagogia do Domínio, defendida por Bloom nos anos 1960, consistia em:",
        "tv_show_id": 11,
        "episode_id": 18
    },
    {
        "id": 58,
        "file_id": 1198,
        "test": "De acordo com Chueiri, cada avaliação apresenta quatro etapas. Assinale a alternativa incorreta.",
        "tv_show_id": 11,
        "episode_id": 18
    },
    {
        "id": 59,
        "file_id": 1199,
        "test": "Sobre a Teoria das Inteligências Múltiplas proposta por Gardner, é incorreto afirmar que:",
        "tv_show_id": 11,
        "episode_id": 19
    },
    {
        "id": 60,
        "file_id": 1199,
        "test": "Por qual razão o método de avaliação por quociente de inteligência (QI) foi criticado por Robert Sternberg?",
        "tv_show_id": 11,
        "episode_id": 19
    },
    {
        "id": 61,
        "file_id": 1202,
        "test": "Segundo Gadotti, qual a real importância da avaliação no processo pedagógico?",
        "tv_show_id": 11,
        "episode_id": 20
    },
    {
        "id": 62,
        "file_id": 1202,
        "test": "Qual desses não faz parte dos objetivos da Avaliação de Desempenho Individual?",
        "tv_show_id": 11,
        "episode_id": 20
    },
    {
        "id": 63,
        "file_id": 1203,
        "test": "Entre as afirmações de Ilza Martins Sant’anna sobre a avaliação, destaque a incorreta.",
        "tv_show_id": 11,
        "episode_id": 470
    },
    {
        "id": 64,
        "file_id": 1203,
        "test": "A Avaliação de Desempenho Individual deve ser pautada por:",
        "tv_show_id": 11,
        "episode_id": 470
    },
    {
        "id": 65,
        "file_id": 1204,
        "test": "Como Luckesi avalia o impacto das reprovações em massa?",
        "tv_show_id": 11,
        "episode_id": 471
    },
    {
        "id": 66,
        "file_id": 1204,
        "test": "Por meio dos relatos dos professores em relação aos métodos avaliativos, é possível perceber que:",
        "tv_show_id": 11,
        "episode_id": 471
    },
    {
        "id": 67,
        "file_id": 1506,
        "test": "O que é ludicidade? ",
        "tv_show_id": 85,
        "episode_id": 560
    },
    {
        "id": 68,
        "file_id": 1506,
        "test": "Por que usar o lúdico na prática antirracista? ",
        "tv_show_id": 85,
        "episode_id": 560
    },
    {
        "id": 69,
        "file_id": 1507,
        "test": "O racismo pode afetar o comportamento de crianças negras quando iniciam no ambiente escolar?",
        "tv_show_id": 85,
        "episode_id": 561
    },
    {
        "id": 70,
        "file_id": 1507,
        "test": "Crianças brancas, quando em ambiente escolar, podem ter comportamentos racistas? ",
        "tv_show_id": 85,
        "episode_id": 561
    },
    {
        "id": 71,
        "file_id": 1508,
        "test": "Quais elementos devem ser considerados quando se escolhe um livro para a leitura antirracista?",
        "tv_show_id": 85,
        "episode_id": 562
    },
    {
        "id": 72,
        "file_id": 1508,
        "test": "Como desenvolver saberes africanos ou afro-brasileiros em sala de aula? ",
        "tv_show_id": 85,
        "episode_id": 562
    },
    {
        "id": 73,
        "file_id": 1510,
        "test": "O que é necessário para se construir como um antirracista?",
        "tv_show_id": 85,
        "episode_id": 563
    },
    {
        "id": 74,
        "file_id": 1510,
        "test": "Embora todas as pessoas negras estejam sujeitas a vivenciar o racismo em algum momento de sua vida, há diferenças comportamentais que devem ser consideradas pelo professor ao iniciar uma atividade antirracista. Quais são elas? ",
        "tv_show_id": 85,
        "episode_id": 563
    },
    {
        "id": 75,
        "file_id": 1509,
        "test": "Na escola, qual é o termo pouco direcionado às crianças, aos adolescentes e aos jovens negros quando fazem um trabalho bem-feito? ",
        "tv_show_id": 85,
        "episode_id": 564
    },
    {
        "id": 76,
        "file_id": 1509,
        "test": "É correto afirmar que o racismo está nas pessoas brasileiras de um modo geral? ",
        "tv_show_id": 85,
        "episode_id": 564
    },
    {
        "id": 77,
        "file_id": 1511,
        "test": "Qual o significado de Ubuntu?",
        "tv_show_id": 85,
        "episode_id": 565
    },
    {
        "id": 78,
        "file_id": 1511,
        "test": "Qual atividade é citada como exemplo? ",
        "tv_show_id": 85,
        "episode_id": 565
    },
    {
        "id": 79,
        "file_id": 1512,
        "test": "Qual deve ser a postura do professor ao abordar o racismo em sala de aula?",
        "tv_show_id": 85,
        "episode_id": 566
    },
    {
        "id": 80,
        "file_id": 1512,
        "test": "Como devem ser as atividades lúdicas apresentadas? ",
        "tv_show_id": 85,
        "episode_id": 566
    },
    {
        "id": 81,
        "file_id": 1515,
        "test": "Qual sentimento pode estar presente nos alunos quando o professor inicia uma roda de conversa sobre racismo? ",
        "tv_show_id": 85,
        "episode_id": 567
    },
    {
        "id": 82,
        "file_id": 1515,
        "test": "Por que fazer uso das brincadeiras pode contribuir para um debate mais efetivo sobre o racismo? ",
        "tv_show_id": 85,
        "episode_id": 567
    },
    {
        "id": 83,
        "file_id": 1513,
        "test": "Como o professor, estando inseguro como o tema, pode começar uma atividade antirracista? ",
        "tv_show_id": 85,
        "episode_id": 568
    },
    {
        "id": 84,
        "file_id": 1513,
        "test": "Qual das ferramentas abaixo não é aconselhável usar em uma sala de aula? ",
        "tv_show_id": 85,
        "episode_id": 568
    },
    {
        "id": 85,
        "file_id": 1514,
        "test": "Como ocorre o processo de desconstrução das concepções racistas para o professor? ",
        "tv_show_id": 85,
        "episode_id": 569
    },
    {
        "id": 86,
        "file_id": 1514,
        "test": "Ao usar brincadeiras e jogos para introduzir uma atividade antirracista, o professor está... Assinale a alternativa incorreta.",
        "tv_show_id": 85,
        "episode_id": 569
    },
    {
        "id": 87,
        "file_id": 1455,
        "test": "Qual é a abordagem recomendada para integrar o desenvolvimento da autoestima dos alunos com a prática educativa, considerando a relação entre inteligência emocional e aprendizagem?",
        "tv_show_id": 14,
        "episode_id": 27
    },
    {
        "id": 88,
        "file_id": 1455,
        "test": "Como se justifica a importância da autoestima organizacional na escola e sua relação com a inteligência emocional?",
        "tv_show_id": 14,
        "episode_id": 27
    },
    {
        "id": 89,
        "file_id": 1456,
        "test": "Como se aborda a diversidade de campos a serem desenvolvidos na educação e como isso influencia a prática escolar?",
        "tv_show_id": 14,
        "episode_id": 28
    },
    {
        "id": 90,
        "file_id": 1456,
        "test": "Como abordar a educação do caráter e qual é a importância dos momentos na formação dos alunos?",
        "tv_show_id": 14,
        "episode_id": 28
    },
    {
        "id": 91,
        "file_id": 1458,
        "test": "Como se deve orientar os professores na diferenciação entre informação e conhecimento?",
        "tv_show_id": 14,
        "episode_id": 29
    },
    {
        "id": 92,
        "file_id": 1458,
        "test": "Quais são as considerações de Celso Antunes sobre a prática pedagógica dos professores?",
        "tv_show_id": 14,
        "episode_id": 29
    },
    {
        "id": 93,
        "file_id": 1459,
        "test": "Como é abordada a questão da avaliação de alunos e qual é o propósito do laudo de competências?",
        "tv_show_id": 14,
        "episode_id": 30
    },
    {
        "id": 94,
        "file_id": 1459,
        "test": "Como são abordadas as questões de aprovação e reprovação na avaliação educacional?",
        "tv_show_id": 14,
        "episode_id": 30
    },
    {
        "id": 95,
        "file_id": 1461,
        "test": "Como o texto aborda a transitoriedade dos conteúdos na educação e qual a importância de desmistificar a interdisciplinaridade nos projetos?",
        "tv_show_id": 14,
        "episode_id": 31
    },
    {
        "id": 96,
        "file_id": 1461,
        "test": "Qual é a abordagem de Celso Antunes em relação aos projetos educacionais e como ele exemplifica essa abordagem com experiências práticas?",
        "tv_show_id": 14,
        "episode_id": 31
    },
    {
        "id": 97,
        "file_id": 1457,
        "test": "Como Celso Antunes redefine o conceito de aula e qual a crítica que ele faz ao modelo tradicional?",
        "tv_show_id": 14,
        "episode_id": 32
    },
    {
        "id": 98,
        "file_id": 1457,
        "test": "Quais são os elementos da PLACA propostos por Celso Antunes para uma situação de aprendizagem adequada?",
        "tv_show_id": 14,
        "episode_id": 32
    },
    {
        "id": 99,
        "file_id": 1460,
        "test": "Como Celso Antunes destaca a importância do papel do professor na relação com os alunos e como isso se reflete no processo de aprendizagem?",
        "tv_show_id": 14,
        "episode_id": 33
    },
    {
        "id": 100,
        "file_id": 1460,
        "test": "Como utilizar exemplos de professores, como Ivete e Yoko, para combater certas concepções sobre o processo de ensino?",
        "tv_show_id": 14,
        "episode_id": 33
    },
    {
        "id": 101,
        "file_id": 1454,
        "test": "Como Celso Antunes destaca a evolução do papel do professor no ensino de valores e qual é a ênfase dada à metodologia de ensino nesse contexto?",
        "tv_show_id": 14,
        "episode_id": 34
    },
    {
        "id": 102,
        "file_id": 1454,
        "test": "Como Celso Antunes diferencia o ensino de valores do simples ato de dar conselhos aos alunos?",
        "tv_show_id": 14,
        "episode_id": 34
    },
    {
        "id": 103,
        "file_id": 1453,
        "test": "Como Celso Antunes aborda a importância da inclusão e pluralidade na educação, utilizando uma metáfora inicial?",
        "tv_show_id": 14,
        "episode_id": 35
    },
    {
        "id": 104,
        "file_id": 1453,
        "test": "Como avaliar alunos com deficiência e qual competência ele destaca como crucial para a inclusão na escola?",
        "tv_show_id": 14,
        "episode_id": 35
    },
    {
        "id": 105,
        "file_id": 1491,
        "test": "Qual é o primeiro passo descrito no vídeo para a preparação de uma aula eficiente?",
        "tv_show_id": 83,
        "episode_id": 547
    },
    {
        "id": 106,
        "file_id": 1491,
        "test": "Para o critério \"Explicar o significado de velocidade\", qual das seguintes alternativas representa uma estratégia de ensino sugerida no vídeo?",
        "tv_show_id": 83,
        "episode_id": 547
    },
    {
        "id": 107,
        "file_id": 1492,
        "test": "Quais são algumas das contribuições fundamentais de Galileu Galilei para o estudo do movimento?",
        "tv_show_id": 83,
        "episode_id": 548
    },
    {
        "id": 108,
        "file_id": 1492,
        "test": "De acordo com o vídeo, por que o conhecimento da história do desenvolvimento de um conceito científico é considerado proveitoso?",
        "tv_show_id": 83,
        "episode_id": 548
    }
]);
}
