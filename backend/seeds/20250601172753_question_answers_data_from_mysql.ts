/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: answer -> question_answers
 * Gerado em: 2025-06-01T17:27:53.315Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('question_answers').del();

  // Insere dados de exemplo do MySQL
  await knex('question_answers').insert([
    {
        "id": 21,
        "is_correct": "AQ==",
        "question_id": 6,
        "reply": "Por meio das missões jesuíticas que buscavam catequizar os indígenas."
    },
    {
        "id": 22,
        "is_correct": "AA==",
        "question_id": 6,
        "reply": "A partir da implementação do sistema educativo europeu durante a colonização."
    },
    {
        "id": 23,
        "is_correct": "AA==",
        "question_id": 6,
        "reply": "Com o desenvolvimento do comércio e o fortalecimento do mercantilismo."
    },
    {
        "id": 24,
        "is_correct": "AA==",
        "question_id": 6,
        "reply": "Por influência das ideias iluministas que criticavam a hegemonia jesuítica."
    },
    {
        "id": 25,
        "is_correct": "AA==",
        "question_id": 7,
        "reply": "Preparar os indígenas para atuar como missionários na Europa."
    },
    {
        "id": 26,
        "is_correct": "AA==",
        "question_id": 7,
        "reply": "Disseminar os conhecimentos científicos e filosóficos da época."
    },
    {
        "id": 27,
        "is_correct": "AQ==",
        "question_id": 7,
        "reply": "Instruir os povos originários na língua portuguesa e na fé cristã."
    },
    {
        "id": 28,
        "is_correct": "AA==",
        "question_id": 7,
        "reply": "Implementar um sistema educacional baseado nos princípios do mercantilismo."
    },
    {
        "id": 29,
        "is_correct": "AA==",
        "question_id": 8,
        "reply": "A implementação de escolas controladas pela Igreja Católica."
    },
    {
        "id": 30,
        "is_correct": "AA==",
        "question_id": 8,
        "reply": "O fechamento das escolas e a disseminação do ensino religioso."
    },
    {
        "id": 31,
        "is_correct": "AQ==",
        "question_id": 8,
        "reply": "A criação de instituições de ensino voltadas às Humanidades."
    },
    {
        "id": 32,
        "is_correct": "AA==",
        "question_id": 8,
        "reply": "A expansão das práticas educativas jesuíticas em todo o território."
    },
    {
        "id": 33,
        "is_correct": "AQ==",
        "question_id": 9,
        "reply": "Pela ênfase na cooperação e no respeito, sem distinção de gênero, e pela influência da teoria libertária."
    },
    {
        "id": 34,
        "is_correct": "AA==",
        "question_id": 9,
        "reply": "Pelo ensino exclusivamente religioso e pela segregação de gênero."
    },
    {
        "id": 35,
        "is_correct": "AA==",
        "question_id": 9,
        "reply": "Pela forte influência do Estado na educação e pela ênfase na obediência."
    },
    {
        "id": 36,
        "is_correct": "AA==",
        "question_id": 9,
        "reply": "Pela promoção de valores conservadores e pela exclusão dos trabalhadores do acesso à educação."
    },
    {
        "id": 37,
        "is_correct": "AA==",
        "question_id": 10,
        "reply": "Propor uma educação estritamente religiosa nas escolas públicas."
    },
    {
        "id": 38,
        "is_correct": "AA==",
        "question_id": 10,
        "reply": "Rejeitar a modernização conservadora promovida pelo governo de Getúlio Vargas."
    },
    {
        "id": 39,
        "is_correct": "AQ==",
        "question_id": 10,
        "reply": "Revolucionar a educação como forma de promover mudanças sociais."
    },
    {
        "id": 40,
        "is_correct": "AA==",
        "question_id": 10,
        "reply": "Implantar um sistema educacional baseado exclusivamente nas ideias pedagógicas tradicionais."
    },
    {
        "id": 41,
        "is_correct": "AA==",
        "question_id": 11,
        "reply": "Favorecendo apenas a burguesia industrial e excluindo as elites."
    },
    {
        "id": 42,
        "is_correct": "AQ==",
        "question_id": 11,
        "reply": "Incorporando ambas as tendências na burocracia da Educação pública."
    },
    {
        "id": 43,
        "is_correct": "AA==",
        "question_id": 11,
        "reply": "Priorizando as ideias pedagógicas tradicionais em detrimento das novas."
    },
    {
        "id": 44,
        "is_correct": "AA==",
        "question_id": 11,
        "reply": "Ignorando completamente as demandas da Igreja Católica."
    },
    {
        "id": 45,
        "is_correct": "AA==",
        "question_id": 12,
        "reply": "Valorização do papel do professor como mediador do conhecimento."
    },
    {
        "id": 46,
        "is_correct": "AA==",
        "question_id": 12,
        "reply": "Transformação das escolas em espaços flexíveis e adaptáveis."
    },
    {
        "id": 47,
        "is_correct": "AQ==",
        "question_id": 12,
        "reply": "Organização das escolas de forma semelhante à das fábricas."
    },
    {
        "id": 48,
        "is_correct": "AA==",
        "question_id": 12,
        "reply": "Ênfase na autonomia e criatividade dos alunos."
    },
    {
        "id": 49,
        "is_correct": "AA==",
        "question_id": 13,
        "reply": "Enfatizando a importância do planejamento detalhado das aulas."
    },
    {
        "id": 50,
        "is_correct": "AA==",
        "question_id": 13,
        "reply": "Criando uma estrutura escolar similar à das empresas."
    },
    {
        "id": 51,
        "is_correct": "AQ==",
        "question_id": 13,
        "reply": "Combatendo a desigualdade social por meio da Educação."
    },
    {
        "id": 52,
        "is_correct": "AA==",
        "question_id": 13,
        "reply": "Priorizando a eficiência do processo de ensino por meio de recursos tecnológicos."
    },
    {
        "id": 53,
        "is_correct": "AA==",
        "question_id": 14,
        "reply": "Ampliou o acesso à educação para todas as camadas sociais."
    },
    {
        "id": 54,
        "is_correct": "AA==",
        "question_id": 14,
        "reply": "Reduziu a desigualdade educacional entre elites e plebeus."
    },
    {
        "id": 55,
        "is_correct": "AQ==",
        "question_id": 14,
        "reply": "Reforçou o desprezo pelos trabalhos manuais e pela classe docente."
    },
    {
        "id": 56,
        "is_correct": "AA==",
        "question_id": 14,
        "reply": "Estabeleceu uma nova hierarquia social baseada na alfabetização."
    },
    {
        "id": 58,
        "is_correct": "AA==",
        "question_id": 16,
        "reply": "Surgimento de uma educação universalizada e desvinculada de valores religiosos."
    },
    {
        "id": 59,
        "is_correct": "AA==",
        "question_id": 16,
        "reply": "Fortalecimento da educação religiosa em detrimento da educação prática."
    },
    {
        "id": 60,
        "is_correct": "AA==",
        "question_id": 16,
        "reply": "Promoção de uma educação voltada exclusivamente para a elite burguesa."
    },
    {
        "id": 61,
        "is_correct": "AQ==",
        "question_id": 16,
        "reply": "Transformação da educação em uma ferramenta para contestar os valores aristocráticos e religiosos."
    },
    {
        "id": 70,
        "is_correct": "AA==",
        "question_id": 19,
        "reply": "Aumento da qualidade do ensino público."
    },
    {
        "id": 71,
        "is_correct": "AQ==",
        "question_id": 19,
        "reply": "Crescimento do analfabetismo funcional."
    },
    {
        "id": 72,
        "is_correct": "AA==",
        "question_id": 19,
        "reply": "Redução das demandas do mercado."
    },
    {
        "id": 73,
        "is_correct": "AA==",
        "question_id": 19,
        "reply": "Melhoria na simetria entre professor e aluno."
    },
    {
        "id": 74,
        "is_correct": "AQ==",
        "question_id": 20,
        "reply": "Favorece a banalização e a deslaicização pedagógica."
    },
    {
        "id": 75,
        "is_correct": "AA==",
        "question_id": 20,
        "reply": "Promove o enriquecimento da relação com o conhecimento."
    },
    {
        "id": 76,
        "is_correct": "AA==",
        "question_id": 20,
        "reply": "Estimula a democratização do espaço escolar."
    },
    {
        "id": 77,
        "is_correct": "AA==",
        "question_id": 20,
        "reply": "Reduz a psicologização das escolas."
    },
    {
        "id": 78,
        "is_correct": "AA==",
        "question_id": 21,
        "reply": "A autoridade deve ser evitada para priorizar o afeto."
    },
    {
        "id": 79,
        "is_correct": "AA==",
        "question_id": 21,
        "reply": "A autoridade deve ser compartilhada entre alunos e professores."
    },
    {
        "id": 80,
        "is_correct": "AQ==",
        "question_id": 21,
        "reply": "A autoridade é essencial para o bom desenvolvimento dos alunos."
    },
    {
        "id": 81,
        "is_correct": "AA==",
        "question_id": 21,
        "reply": "A autoridade deve ser substituída pela afetividade na sala de aula."
    },
    {
        "id": 82,
        "is_correct": "AA==",
        "question_id": 22,
        "reply": "Por meio do domínio exclusivo da metodologia de ensino."
    },
    {
        "id": 83,
        "is_correct": "AQ==",
        "question_id": 22,
        "reply": "Por meio do tripé de domínio teórico, destreza metodológica e lastro ético."
    },
    {
        "id": 84,
        "is_correct": "AA==",
        "question_id": 22,
        "reply": "Por meio da busca por entretenimento e animação na sala de aula."
    },
    {
        "id": 85,
        "is_correct": "AA==",
        "question_id": 22,
        "reply": "Por meio do estímulo à desesperança e à reflexão sobre o passado."
    },
    {
        "id": 86,
        "is_correct": "AQ==",
        "question_id": 23,
        "reply": "Gera confusão de valores e comportamentos inadequados."
    },
    {
        "id": 87,
        "is_correct": "AA==",
        "question_id": 23,
        "reply": "Reforça a importância da escola como ambiente familiar."
    },
    {
        "id": 88,
        "is_correct": "AA==",
        "question_id": 23,
        "reply": "Valoriza os profissionais especialistas em detrimento dos professores."
    },
    {
        "id": 89,
        "is_correct": "AA==",
        "question_id": 23,
        "reply": "Promove uma abordagem mais eficaz na aprendizagem dos alunos."
    },
    {
        "id": 90,
        "is_correct": "AA==",
        "question_id": 24,
        "reply": "Porque os alunos devem resolver questões psicológicas fora do ambiente escolar."
    },
    {
        "id": 91,
        "is_correct": "AA==",
        "question_id": 24,
        "reply": "Porque os alunos já têm acesso a psicólogos fora da escola."
    },
    {
        "id": 92,
        "is_correct": "AA==",
        "question_id": 24,
        "reply": "Porque os professores não têm habilidades para lidar com questões psicológicas."
    },
    {
        "id": 93,
        "is_correct": "AQ==",
        "question_id": 24,
        "reply": "Porque isso desvirtua o papel principal do professor como educador."
    },
    {
        "id": 94,
        "is_correct": "AA==",
        "question_id": 25,
        "reply": "Como um ambiente que favorece o embate narrativo entre gerações."
    },
    {
        "id": 95,
        "is_correct": "AQ==",
        "question_id": 25,
        "reply": "Como um local de desertificação devido à repetição de práticas obsoletas."
    },
    {
        "id": 96,
        "is_correct": "AA==",
        "question_id": 25,
        "reply": "Como um espaço acolhedor que prioriza a disciplina sobre o conhecimento."
    },
    {
        "id": 97,
        "is_correct": "AA==",
        "question_id": 25,
        "reply": "Como um ambiente normatizado que desfavorece a aprendizagem dos alunos."
    },
    {
        "id": 98,
        "is_correct": "AA==",
        "question_id": 26,
        "reply": "Ser aquele que identifica problemas apenas."
    },
    {
        "id": 99,
        "is_correct": "AA==",
        "question_id": 26,
        "reply": "Ser o mediador entre o passado e o novo na educação."
    },
    {
        "id": 100,
        "is_correct": "AA==",
        "question_id": 26,
        "reply": "Oferecer diagnósticos de problemas para resolução externa."
    },
    {
        "id": 101,
        "is_correct": "AQ==",
        "question_id": 26,
        "reply": "Apontar caminhos e soluções pedagógicas para questões educacionais."
    },
    {
        "id": 102,
        "is_correct": "AA==",
        "question_id": 27,
        "reply": "Promover o pensamento criativo e a restrição de ideias"
    },
    {
        "id": 103,
        "is_correct": "AA==",
        "question_id": 27,
        "reply": "Promover o compartilhamento de ideias irrelevantes."
    },
    {
        "id": 104,
        "is_correct": "AA==",
        "question_id": 27,
        "reply": "Promover o desenvolvimento da inteligência individual."
    },
    {
        "id": 105,
        "is_correct": "AQ==",
        "question_id": 27,
        "reply": "Promover uma rede viva de diálogos colaborativos."
    },
    {
        "id": 106,
        "is_correct": "AQ==",
        "question_id": 28,
        "reply": "É importante considerar a diversidade de ideias e as perspectivas dos outros."
    },
    {
        "id": 107,
        "is_correct": "AA==",
        "question_id": 28,
        "reply": "É importante manter espaços fixos de aprendizagem."
    },
    {
        "id": 108,
        "is_correct": "AA==",
        "question_id": 28,
        "reply": "É importante promover o diálogo fluido e sem direcionamento."
    },
    {
        "id": 109,
        "is_correct": "AA==",
        "question_id": 28,
        "reply": "É importante promover momentos de diálogos em que o professor seja o protagonista."
    },
    {
        "id": 110,
        "is_correct": "AA==",
        "question_id": 29,
        "reply": "Identidade."
    },
    {
        "id": 111,
        "is_correct": "AA==",
        "question_id": 29,
        "reply": "Visibilidade."
    },
    {
        "id": 112,
        "is_correct": "AA==",
        "question_id": 29,
        "reply": "Flexibilidade."
    },
    {
        "id": 113,
        "is_correct": "AQ==",
        "question_id": 29,
        "reply": "Criatividade."
    },
    {
        "id": 114,
        "is_correct": "AA==",
        "question_id": 30,
        "reply": "A aprendizagem é construída dentro de uma situação-problema, não chegando a uma conclusão."
    },
    {
        "id": 115,
        "is_correct": "AA==",
        "question_id": 30,
        "reply": "A aprendizagem torna-se mais restrita, pois um grupo de alunos se destaca mais do que os outros."
    },
    {
        "id": 116,
        "is_correct": "AQ==",
        "question_id": 30,
        "reply": "A aprendizagem torna-se mais dinâmica, em que não existe certo ou errado, pois todos os posicionamento são importantes."
    },
    {
        "id": 117,
        "is_correct": "AA==",
        "question_id": 30,
        "reply": "A aprendizagem ocorre em debates e discussões em que as soluções acontecem de forma individual."
    },
    {
        "id": 118,
        "is_correct": "AQ==",
        "question_id": 31,
        "reply": "Os ambientes de aprendizagem tornam-se flexíveis."
    },
    {
        "id": 119,
        "is_correct": "AA==",
        "question_id": 31,
        "reply": "Os ambientes de aprendizagem tornam-se rígidos."
    },
    {
        "id": 120,
        "is_correct": "AA==",
        "question_id": 31,
        "reply": "Os ambientes de aprendizagem não dialogam com o conhecimento."
    },
    {
        "id": 121,
        "is_correct": "AA==",
        "question_id": 31,
        "reply": "Os ambientes de aprendizagem não são importantes."
    },
    {
        "id": 122,
        "is_correct": "AQ==",
        "question_id": 32,
        "reply": "Mobilização de conhecimentos, participação, envolvimento e soluções eficientes."
    },
    {
        "id": 123,
        "is_correct": "AA==",
        "question_id": 32,
        "reply": "Mobilização de conhecimentos, separação dos estudantes e seriedade."
    },
    {
        "id": 124,
        "is_correct": "AA==",
        "question_id": 32,
        "reply": "Mobilização de conhecimentos, conflitos entre os alunos, participação e inteligência individual."
    },
    {
        "id": 125,
        "is_correct": "AA==",
        "question_id": 32,
        "reply": "Mobilização de diálogos colaborativos, soluções ineficientes e aprendizagem superficial."
    },
    {
        "id": 126,
        "is_correct": "AA==",
        "question_id": 33,
        "reply": "Memorização."
    },
    {
        "id": 127,
        "is_correct": "AA==",
        "question_id": 33,
        "reply": "Mediação."
    },
    {
        "id": 128,
        "is_correct": "AA==",
        "question_id": 33,
        "reply": "Brainstorming."
    },
    {
        "id": 129,
        "is_correct": "AQ==",
        "question_id": 33,
        "reply": "Insight."
    }
]);
}
