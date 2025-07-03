/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: author -> authors
 * Gerado em: 2025-06-01T17:29:23.992Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('authors').del();

  // Insere dados de exemplo do MySQL
  await knex('authors').insert([
    {
        "id": 1,
        "description": "Sabercon",
        "email": "estevao@programmer.net",
        "is_active": "AQ==",
        "name": "SABERCON EDUCATIVA"
    },
    {
        "id": 2,
        "description": "FÁBIO ROBERTO RAMOS LOPES",
        "email": "123",
        "is_active": "AA==",
        "name": "FÁBIO ROBERTO RAMOS LOPES"
    },
    {
        "id": 3,
        "description": "PEDAGOGA",
        "email": null,
        "is_active": "AA==",
        "name": "ANDRÉA RIBEIRO RAMOS"
    },
    {
        "id": 4,
        "description": "ATTA MIDIA",
        "email": null,
        "is_active": "AA==",
        "name": "ATTA MIDIA"
    },
    {
        "id": 5,
        "description": "BRUNO MARQUES DOS SANTOS, ANDRADINENSE NASCIDO EM 09 DE MARÇO DE 1984. CONCLUIU A LICENCIATURA EM FÍSICA PELA FACULDADE DE ENGENHARIA DA UNESP DE ILHA SOLTEIRA EM 2007. EM 2008 INGRESSOU NA REDE ESTADUAL DE ENSINO PAULISTA NA CIDADE DE POMPÉIA/SP, NA ESCO",
        "email": null,
        "is_active": "AA==",
        "name": "BRUNO MARQUES DOS SANTOS"
    },
    {
        "id": 6,
        "description": "FORMADA EM HISTÓRIA PELA UFRGS EM 2008, É MESTRA (2012) E DOUTORA (2019) PELA MESMA INSTITUIÇÃO. TEM ESPECIALIZAÇÃO EM BASE NACIONAL COMUM CURRICULAR (BNCC) (2021) PELO INSTITUTO SINGULARIDADES E ATUA HÁ MAIS DE 10 ANOS COM FORMAÇÃO DE PROFESSORES EM TODA",
        "email": null,
        "is_active": "AA==",
        "name": "DÉBORA REGINA VOGT DOS SANTOS"
    },
    {
        "id": 7,
        "description": "POSSUI GRADUAÇÃO EM GEOGRAFIA PELA UNIVERSIDADE ESTADUAL PAULISTA JÚLIO DE MESQUITA FILHO, CAMPUS DE RIO CLARO, NAS MODALIDADES LICENCIATURA PLENA, BACHARELADO, MESTRADO E DOUTORADO TAMBÉM PELA UNIVERSIDADE ESTADUAL PAULISTA JÚLIO DE MESQUITA FILHO",
        "email": null,
        "is_active": "AQ==",
        "name": "DENISE PRATES XAVIER"
    },
    {
        "id": 8,
        "description": "Elisandra Pereira. Mestra em Educação-UNESP/ Bauru. Professora da área de Gestão no Instituto Federal de São Paulo campus Birigui. Presidenta da Comissão ETNO-Birigui. Especialista em Formação Docente para o Ensino da História e Cultura Afro-brasileira. Licenciada em Ciências Sociais. Representante do Núcleo de Estudos Afro-Brasileiros e Indígenas do Instituto Federal de São Paulo. Autora dos cursos de extensão Construção da Identidade Étnica do Negro, Formação Docente para o Ensino da História e Cultura Africana e Afro-brasileira e do Projeto SAWABONA: contando africanidades.",
        "email": null,
        "is_active": "AQ==",
        "name": "ELISANDRA PEREIRA"
    },
    {
        "id": 9,
        "description": "FÁBIO ROBERTO LOPES, GRADUADO EM LETRAS PORTUGUÊS/ INGLÊS, PELA FAP- FACULDADE DA ALTA PAULISTA, ADMINISTRAÇÃO COM ÊNFASE EM GESTÃO DE PESSOAS. ESPECIALIZAÇÃO EM NEUROCIÊNCIAS E EDUCAÇÃO BILÍNGUE ATUALMENTE É PROFESSOR DE EDUCAÇÃO BÁSICA III- LINGUAGENS -",
        "email": null,
        "is_active": "AA==",
        "name": "FÁBIO ROBERTO RAMOS LOPES"
    },
    {
        "id": 10,
        "description": "FABRICIO COSTA DE OLIVEIRA, NASCIDO EM 19 DE JULHO DE 1982. CONCLUIU O BACHARELADO E A LICENCIATURA EM EDUCAÇÃO FÍSICA PELA UNIVERSIDADE DE MARÍLIA - UNIMAR EM 2005.",
        "email": null,
        "is_active": "AA==",
        "name": "FABRÍCIO COSTA DE OLIVEIRA"
    },
    {
        "id": 11,
        "description": "FERNANDA RAQUEL DE CARVALHO TEIXEIRA MARIN, FORMADA NO MAGISTÉRIO PELO CEFAM- CENTRO ESPECIFICO DE FORMAÇÃO E APERFEIÇOAMENTO DO MAGISTÉRIO, GRADUADA EM LETRAS PORTUGUÊS/ INGLÊS, PELA FAP- FACULDADE DA ALTA PAULISTA, ARTES VISUAIS-UNIVERSIDADE METROPOLITA",
        "email": null,
        "is_active": "AA==",
        "name": "FERNANDA RAQUEL DE CARVALHO TEIXEIRA MARIN"
    },
    {
        "id": 12,
        "description": "Professor Gabriel Santana de Moraes, graduado em Filosofia, Pedagogia e Geografia.",
        "email": null,
        "is_active": "AQ==",
        "name": "GABRIEL SANTANA DE MORAES"
    },
    {
        "id": 13,
        "description": "Glades M. D. Serra é licenciada em pedagogia pela Universidade de São Paulo (USP), bacharel e licenciada em psicologia pelo Instituto Metodista de Ensino Superior e licenciada em matemática pela Universidade Iguaçu (UNIG). Possui mestrado e doutorado em educação pela Faculdade de Educação da Universidade de São Paulo. É pós-graduada em Formação de Formadores, pela Universidade de Brasília (UnB); em Administração Escolar – Pesquisa e Extensão pela Faculdade de Educação e Letras – UNIG; em Psicologia da Educação - Projeto de Capacitação Pedagógica aos Educadores da Rede de Ensino SESI-SP, pela Pontifícia Universidade de São Paulo (PUC-SP). Por mais de 30 anos atuou em educação, em escolas estaduais como professora, na rede SESI-SP (Serviço Social da Indústria de São Paulo) como professora e analista pedagógica; na rede SENAI-SP (Serviço Nacional de Aprendizagem Industrial de São Paulo) atuou como especialista em educação e Coordenadora Pedagógica, desenvolvendo formação profissional em educação para profissionais da rede SENAI-SP.",
        "email": null,
        "is_active": "AQ==",
        "name": "GLADES M. D. SERRA"
    },
    {
        "id": 14,
        "description": "JULIANA ANTONIASSI, POSSUI GRADUAÇÃO EM CIÊNCIAS BIOLÓGICAS - LICENCIATURA E BACHARELADO PELO CENTRO UNIVERSITÁRIO DE RIO PRETO - UNIRP.",
        "email": null,
        "is_active": "AQ==",
        "name": "JULIANA ANTONIASSI"
    },
    {
        "id": 15,
        "description": "Julio Amaro de Souza Neto, nascido em 20 de novembro de 1988. Concluiu a licenciatura plena em Geografia na Unesp (Universidade Estadual Paulista) de Presidente Prudente-SP em 2011. Desenvolveu pesquisas durante a graduação analisando livros didáticos utilizados na rede pública de ensino, e também, em climatologia. Foi bolsista do cursinho pré-vestibular da própria universidade para pessoas carentes economicamente. Trabalhou um curto período na rede pública de ensino, tem vasta experiência na rede privada de ensino com ensino médio e cursinho pré-vestibular, junto aos principais sistemas de ensino no estado de São Paulo (Objetivo, Anglo, Etapa). A partir de 2014 foi contratado para trabalhar em um novo ensino médio, baseado em competências e capacidades,que teve influências do modelo de ensino canadense Profunding Learning e ainda, utilizando estratégias de ensino com metodologias ativas.Após a consolidação desse novo ensino médio, tornou-se também, consultor, para a replicação desse mesmo ensino em outro estado do país.",
        "email": null,
        "is_active": "AQ==",
        "name": "JULIO AMARO DE SOUZA NETO"
    },
    {
        "id": 16,
        "description": "KARIME NOGUEIRA, LICENCIATURA EM LETRAS: PORTUGUÊS/INGLÊS -INSTITUIÇÃO: FAP/SP -CONCLUSÃO: 2009 ESPECIALIZAÇÃO - ESPECIALIZAÇÃO EM: LIBRAS E METODOLOGIAS DE ENSINO PARA SURDOS. (600 HORAS).",
        "email": null,
        "is_active": "AQ==",
        "name": "KARIME NOGUEIRA DE OLIVEIRA"
    },
    {
        "id": 17,
        "description": "Luciano Emanuel Silva é pós-Graduado Lato Sensu em Educação com especialização em metodologias, inovações educacionais e protagonismo estudantil pela Pontifícia Universidade Católica do Rio Grande do Sul (PUCRS) com o projeto Programa de atualização de Educadores, contribuindo com a implementação de tecnologias digitais e metodologias ativas na formação dos profissionais de Educação. Sua primeira graduação foi em Ciências Sociais e licenciatura em Sociologia pela Universidade Estadual Paulista em São Paulo (UNESP) em 2015, onde participou como estagiário de iniciação científica do Grupo de Pesquisa Negro e Educação (GEPENE) em 2011. Foi estagiário do Programa Institucional de Bolsas de Iniciação a Docência (PIBID) onde desenvolveu atividades promovidas pelo Laboratório de Fotografia, como a construção de materiais didáticos escritos e audiovisuais do Núcleo de Ensino em 2012. Foi estagiário do Programa de Residência Educacional pela Fundação de Desenvolvimento Administrativo (FUNDAP) onde desenvolveu atividades pedagógicas e administrativas nas escolas em 2013/14 e foi monitor na disciplina de Sociologia da Educação no ano de 2014. Desde 2011 desenvolve atividades como docente na área de Ciências Humanas no Ensino Fundamental e Médio na rede pública e privada de Educação e atua como professor-pesquisador desenvolvendo estudos e práticas administrativas e pedagógicas na área da Educação. Atualmente oferece soluções e serviços de consultoria e assessoria em inteligência e tecnologia educacionais nas escolas e treinamentos, palestras e workshops para formação continuada aos profissionais da Educação.",
        "email": null,
        "is_active": "AQ==",
        "name": "LUCIANO EMANUEL SILVA"
    },
    {
        "id": 18,
        "description": "DOUTORADO EM EDUCAÇÃO PELA FACULDADE DE CIÊNCIAS E TECNOLOGIA DA UNIVERSIDADE ESTADUAL PAULISTA (EM ANDAMENTO) MESTRE EM ENSINO DE FÍSICA PELA UNIVERSIDADE ESTADUAL PAULISTA (2015).",
        "email": null,
        "is_active": "AQ==",
        "name": "LUÍS FERNANDO LOPES"
    },
    {
        "id": 19,
        "description": "Marcos da Silva Gomes, nascido em Jaú em 15 de março de 1982, é graduado em Licenciatura Plena em Química pela Universidade Federal de São Carlos (UFSCar). Também é Mestre em Química Analítica e Doutor em Ciências pela UFSCar. Desenvolveu parte das pesquisas de doutorado na Florida International University. Na graduação, atuou como educador, desenvolvendo experimentos didáticos para cursos de graduação. Possui experiência docente no ensino médio, técnico e superior. Foi professor da Universidade Estadual Paulista \"Júlio de Mesquita Filho\" (UNESP) e do curso semipresencial em Licenciatura em Ciências da Universidade de São Paulo (USP) e Universidade Virtual do Estado de São Paulo (UNIVESP). Foi professor do Instituto Federal de Educação, Ciência e Tecnologia de São Paulo (IFSP), campus Avançado Rio Claro e do Serviço Social da Indústria (SESI). Atualmente é professor do Serviço Nacional de Aprendizagem Industrial (SENAI) \"Shunji Nishimura\" e criador de conteúdos digitais.",
        "email": null,
        "is_active": "AQ==",
        "name": "MARCOS DA SILVA GOMES"
    },
    {
        "id": 20,
        "description": "Maria Clara Tessaroli Borges Professor de História efetivo da Secretaria Estadual da Educação de São Paulo, professor de História na Funbbe (Fundação Barra Bonita de Ensino), atuei como professor de História e Ética Colégio Galileu – Mackenzie, Colégio ADV e Professor do Ensino Médio e Técnico na Etec Comendador João Rays de Barra Bonita.  Fui Coordenador Pedagógico – Ensino Fundamental Anos Finais na escola E.E Antônio Ferraz – Mineiros do Tietê  Educador – Sala de Projetos Casa de Cultura e Cidadania – AES Tietê - Unidade Barra Bonita.  Membro da equipe idealizadora do projeto Circo Guri, selecionado pela ILANUD (Instituto Latino Americano das Nações Unidas) como um dos melhore projetos do país para prevenção do delito na juventude.  Membro da equipe idealizadora do Ponto de Cultura do Estado de São Paulo - Carreta dos Sonhos em Igaraçu do Tietê",
        "email": null,
        "is_active": "AQ==",
        "name": "MARIA CLARA TESSAROLI BORGES"
    },
    {
        "id": 21,
        "description": "Maria Cristina Andrade Marino, é formada em pedagogia com especialização em administração escolar e supervisão de ensino; formação de professores para o ensino superior e MBA em Gestão Escolar.",
        "email": null,
        "is_active": "AQ==",
        "name": "MARIA CRISTINA ANDRADE MARINO"
    },
    {
        "id": 22,
        "description": "Professor de História efetivo da Secretaria Estadual da Educação de São Paulo, professor de História na Funbbe (Fundação Barra Bonita de Ensino), atuei como professor de História e Ética Colégio Galileu – Mackenzie, Colégio ADV e Professor do Ensino Médio e Técnico na Etec Comendador João Rays de Barra Bonita.  Fui Coordenador Pedagógico – Ensino Fundamental Anos Finais na escola E.E Antônio Ferraz – Mineiros do Tietê  Educador – Sala de Projetos Casa de Cultura e Cidadania – AES Tietê - Unidade Barra Bonita.  Membro da equipe idealizadora do projeto Circo Guri, selecionado pela ILANUD (Instituto Latino Americano das Nações Unidas) como um dos melhore projetos do país para prevenção do delito na juventude.  Membro da equipe idealizadora do Ponto de Cultura do Estado de São Paulo - Carreta dos Sonhos em Igaraçu do Tietê",
        "email": null,
        "is_active": "AQ==",
        "name": "RENATO PRATES XAVIES"
    },
    {
        "id": 23,
        "description": "LICENCIATURA E BACHARELADO EM CIÊNCIAS BIOLÓGICAS, MESTRADO E DOUTORADO EM CIÊNCIAS (ÁREA DE CONCENTRAÇÃO:ENTOMOLOGIA) PELO DEPARTAMENTO DE BIOLOGIA DA FACULDADE DE FILOSOFIA, CIÊNCIAS E LETRAS DE RIBEIRÃO PRETO DA UNIVERSIDADE DE SÃO PAULO.",
        "email": null,
        "is_active": "AQ==",
        "name": "RICARDO MARQUES COUTO"
    },
    {
        "id": 24,
        "description": "Rosimeire Pavret é licenciada em pedagogia pela Universidade de Taubaté (UNITAU) e cursou Supervisão Escolar na Universidade de Guarulhos – (UnG). É pós-graduada em Psicopedagogia pela UNITAU , Atendimento clínico psicopedagógico em problemas de aprendizagem pela UNITAU; Educação Especial - Gestão Pedagógica e Política para uma Educação Inclusiva-BAGOZZI e MBA em Gestão Empreendedora - Educação, pela Universidade Federal Fluminense (UFF) Por 34 anos atuou na rede SESI-SP (Serviço Social da Indústria de São Paulo) iniciando como professora alfabetizadora, atuou como diretora escolar e nos últimos 30 anos dedicou-se à formação de professores, diretores e coordenadores pedagógicos na área da supervisão escolar.",
        "email": null,
        "is_active": "AQ==",
        "name": "ROSIMEIRE PAVRET"
    },
    {
        "id": 25,
        "description": "Samuel NHANDEWA  Formação: Geografia, História, Pós graduado em Docência no ensino superior, Metodologias ativas e tecnologia na educação , direção escolar, educação infantil.",
        "email": null,
        "is_active": "AQ==",
        "name": "SAMUEL OLIVEIRA"
    },
    {
        "id": 26,
        "description": "Graduada em Biblioteconomia pela UNESP, Pós-Graduada em Gestão de Bibliotecas pela Faculdades Integradas Coração de Jesus e Mestre em Ciência da Informação e Biblioteconomia pela UNESP.  Profissional com mais de 21 anos de experiência em Biblioteconomia, coordenando bibliotecas (física e virtual) e gerenciando sistemas de informação.",
        "email": null,
        "is_active": "AQ==",
        "name": "SIMONE LOPES DIAS"
    },
    {
        "id": 27,
        "description": "ATTA MIDIA",
        "email": "ATTA MIDIA",
        "is_active": "AA==",
        "name": "ATTA MIDIA"
    },
    {
        "id": 28,
        "description": "Bruno Marques dos Santos, Andradinense nascido em 09 de março de 1984. Concluiu a licenciatura em física pela Faculdade de Engenharia da Unesp de Ilha Solteira em 2007. Em 2008 ingressou na rede estadual de ensino paulista na cidade de Pompéia/SP, na Escola Estadual Cultura e Liberdade, transferindo o cargo para Arealva/SP, na Escola Estadual Sebastião Inoc Assumpção em 2010, ficando na rede pública até 2013. De 2010 até 2012 realizou mestrado em Educação para o Ensino de Ciências pela Faculdade de Ciências da Unesp de Bauru. Durante o mestrado participou de projeto financiado pela Capes para criar um Pequeno Grupo de Pesquisa na cidade de Arealva/SP, trabalhando com estudos de avaliação em larga escala, questões sociocientíficas e formação de professores. Nos anos de 2013 e 2014 ingressou na Faculdade de Tecnologia de Garça/SP atuando principalmente como professor de Cálculo Diferencial e Integral. Em 2013 é contratado pelo Centro Universitário Eurípedes de Marília (Univem) para ministrar aulas relacionadas a matemática e física nos cursos de Bacharel em Ciências da Computação e Bacharel em Engenharia de Produção, atuando até os dias atuais. Em 2014 é contratado pela Escola SENAI Shunji Nishimura para estruturar o currículo de Ciências da Natureza e, em 2015, passou a lecionar física de maneira inter, multi e transdisciplinar, atuando até os dias atuais.",
        "email": null,
        "is_active": "AQ==",
        "name": "BRUNO MARQUES DOS SANTOS"
    },
    {
        "id": 29,
        "description": "Mestre em Gestão e Desenvolvimento da Educação Profissional, Centro Estadual de Educação Tecnológica Paula Souza, CEETEPS, Brasil (2020), MBA Excelência em Gestão de Projetos e Processos Organizacionais, Centro Estadual de Educação Tecnológica Paula Souza, CEETEPS, Brasil (2014). Possui graduação em Licenciatura em Pedagogia pela Universidade Nove de Julho(2008), graduação em Tecnologia em Automação de Escritórios e Secretariado pela Faculdade de Tecnologia de São Paulo(1999), graduação em Licenciatura em Letras pelo Centro Universitário das Faculdades Metropolitanas Unidas(2006), especialização em Educação a distância: elaboração de material, tutoria e ambientes virtuais pela Universidade Cruzeiro do Sul(2017) e especialização em Língua Inglesa e Tradução: estratégias de ensino pela Universidade Paulista(2003).",
        "email": null,
        "is_active": "AQ==",
        "name": "ANDRÉA RIBEIRO RAMOS"
    },
    {
        "id": 30,
        "description": "Débora Regina Vogt dos Santos Formada em história, mestre e doutora tem mais de 10 anos de experiência como docente. Foi professora de nível básico, analista educacional, professora de nivel superior e coordenadora de curso. Desde 2012 trabalha com formação de professores e com ensino EAD tendo atuado em cursos de diversas regiões do país. É entusiasta das novas tecnologias na educação e é fundadora da empresa Multiplica Educação.",
        "email": null,
        "is_active": "AQ==",
        "name": "DÉBORA REGINA VOGT DOS SANTOS"
    },
    {
        "id": 31,
        "description": "Fabricio Costa de Oliveira, nascido em 19 de julho de 1982. Concluiu o bacharelado e a licenciatura em Educação Física pela Universidade de Marília - UNIMAR em 2005. Nos anos de 2005 e 2006, cursou o programa de pós-graduação Lato Sensu na Universidade de Araraquara - Uniara, em atividade física para grupos especiais. De 2010 a 2012, realizou o mestrado em Educação, no departamento de Psicologia do Desenvolvimento Humano, da UNESP de Marília-SP. De 2016 a 2019, realizou o programa de Doutorado em educação, no departamento de Psicologia do Desenvolvimento Humano da UNESP de Marília-SP. Atualmente ministra aulas de Educação Física na escola inovadora que pertence a rede SENAI de São Paulo, localizada na Fundação Shunji Nishimura da cidade de Pompeia-SP e também, é consultor do SENAI São Paulo, replicando o modelo educacional Arquitetura Pedagógica Transformação em outras escolas do Brasil.",
        "email": null,
        "is_active": "AQ==",
        "name": "FABRÍCIO COSTA DE OLIVEIRA"
    },
    {
        "id": 32,
        "description": "Fábio Roberto Lopes, graduado em Letras Português/ Inglês, pela FAP- Faculdade da Alta Paulista, Administração com ênfase em Gestão de Pessoas. Especialização em Neurociências e Educação Bilíngue Atualmente é professor de Educação Básica III- Linguagens - Língua Inglesa, na escola SENAI - Shunji Nishimura - Pompeia-SP.",
        "email": null,
        "is_active": "AQ==",
        "name": "FÁBIO ROBERTO LOPES"
    },
    {
        "id": 33,
        "description": "Fernanda Raquel de Carvalho Teixeira Marin, formada no magistério pelo CEFAM- Centro Especifico de Formação e Aperfeiçoamento do Magistério, graduada em Letras Português/ Inglês, pela FAP- Faculdade da Alta Paulista, Artes Visuais-Universidade Metropolitana de Santos e Pedagogia pela UNESP- Universidade Estadual Paulista. Pós-graduada em Ensino de Arte, e Cultura e Educação. Atualmente é professora de Educação Básica III- Arte, na escola SENAI - Shunji Nishimura - Pompeia-SP.",
        "email": null,
        "is_active": "AQ==",
        "name": "FERNANDA RAQUEL DE CARVALHO TEIXEIRA MARIN"
    },
    {
        "id": 34,
        "description": "Lilian Fernandes Carneiro Palestrante, Mentora de idiomas Inglês e Espanhol, Educadora e Escritora *Currículo Lattes completo: http://lattes.cnpq.br/1282977065213791 Palestrante e mentora especialista em Inteligências Múltiplas. Mestre em Ciências Humanas e especialização em Língua Inglesa (Lato-Sensu), Certificado de Proficiência na Língua Inglesa pela Universidade de Cambridge-Inglaterra, especialização em Controladoria pela FGV - Fundação Getúlio Vargas. É graduada em Letras e Pedagogia. Participou de intercâmbio estudantil na Inglaterra e Espanha. Frequentou o \"III Congreso Internacional de Liderazgo, Creatividad y nuevas tendencias en el aula\" em Buenos Aires. Está em sala de aula desde 1980. Atuou na área Financeira por 30 anos em empresa multinacional americana.",
        "email": null,
        "is_active": "AQ==",
        "name": "LILIAN FERNANDES CARNEIRO"
    },
    {
        "id": 35,
        "description": "Isabela Bernardes dos Santos da Cruz, mariliense, nasceu em 27 de julho de 1984. Concluiu a licenciatura em Língua Portuguesa e Língua Espanhola pela UNIVEM - Universidade de Marília, em 2009. Em 2014, foi contratada pela Escola SENAI Shunji Nishimura para estruturar o currículo de Linguagens e, em 2015, passou a lecionar Língua Portuguesa e Espanhola de maneira inter, multi e transdisciplinar, atuando até os dias atuais.",
        "email": null,
        "is_active": "AQ==",
        "name": "ISABELA BERNARDES"
    },
    {
        "id": 36,
        "description": "Lívia Maria Coelho Martins Ribeiro nasceu em 24 de janeiro de 1987. Concluiu a licenciatura em Matemática pela Unesp de Presidente Prudente em 2008. Entre os anos de 2018 a 2020, realizou os cursos de pós-graduação Lato Sensu na Faculdade Venda Nova do Imigrante - Faveni de Tópicos em Matemática, Matemática Financeira e Estatística e Metodologia do Ensino da Matemática. Atualmente, ministra aulas de Matemática na escola inovadora que pertence a rede SENAI de São Paulo, localizada na Fundação Shunji Nishimura da cidade de Pompeia - SP",
        "email": null,
        "is_active": "AQ==",
        "name": "LIVIA MARIA COELHO MARTINS RIBEIRO"
    },
    {
        "id": 37,
        "description": "Doutoranda em Educação Especial pela Universidade Federal de São Carlos (em andamento).  Mestre em Educação pela Universidade de São Paulo (2007).  Especialista em Neuropsicopedagogia (2021), Direito Educacional (2020) e Fonoaudiologia Educacional (2010), com Aprimoramento em Fonoaudiologia pelo Hospital do Servidor Estadual de São Paulo (2000). Fonoaudióloga pela Faculdade de Medicina da Universidade de São Paulo(1998)  Pedagoga – licenciatura plena pela Faculdade Associada Brasil (2018). Formação técnica para o Magistério – Colégio de Santa Inês (1992). Consultora em acessibilidade educacional, equidade e diversidade. Docente da pós-graduação em Educação da Uni FMU, Faculdade Nova e do CEFAC. Autora de livros e materiais de formação docente. ORCID: https://orcid.org/0000-0002-5436-9490 Currículo Lattes: http://lattes.cnpq.br/0795334188242497",
        "email": null,
        "is_active": "AQ==",
        "name": "SORAIA ROMANO"
    },
    {
        "id": 38,
        "description": "Camila Nogueira de Lima Hila, nascida em 11 de setembro de 1980. Graduada em licenciatura em Matemática pelo Centro Universitário de Adamantina em 2008. Em 2014 é contratada pela Escola SENAI Shunji Nishimura de Pompeia-SP, para estruturar o currículo de Matemática, e, em 2015, passou a lecionar de maneira inter, multi e transdisciplinar, atuando até o ano de 2021. Atualmente ministra aulas de Matemática para o Ensino Fundamental 2 na escola SESI de Marília-SP.",
        "email": null,
        "is_active": "AQ==",
        "name": "CAMILA NOGUEIRA DE LIMA HILA"
    }
]);
}
