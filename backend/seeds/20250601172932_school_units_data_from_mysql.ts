/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: unit -> school_units
 * Gerado em: 2025-06-01T17:29:32.529Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('school_units').del();

  // Insere dados de exemplo do MySQL
  await knex('school_units').insert([
    {
        "id": 1,
        "institution_id": 2,
        "name": "EMEF LEVY GONÇALVES DE OLIVEIRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 2,
        "institution_id": 2,
        "name": "EMEF EIZABURO NOMURA - PROF",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 3,
        "institution_id": 2,
        "name": "Secretaria de Educação",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 4,
        "institution_id": 2,
        "name": "EMEF JOÃO TIBURCIO SILVA FILHO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 5,
        "institution_id": 2,
        "name": "EMEF JOSÉ DOMINGOS DA SILVEIRA - PROF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 6,
        "institution_id": 2,
        "name": "EMEF FIORAVANTE BARLETTA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 7,
        "institution_id": 2,
        "name": "EMEF SANDRO LUIZ BRAGA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 8,
        "institution_id": 2,
        "name": "EMEF ONOFRA DA SILVA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 9,
        "institution_id": 2,
        "name": "EMEF OSVALDO BATISTA PEREIRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 10,
        "institution_id": 2,
        "name": "Secretaria de Educação",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 11,
        "institution_id": 2,
        "name": "Secretaria de Educação",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 12,
        "institution_id": 2,
        "name": "Secretaria de Educação",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 13,
        "institution_id": 2,
        "name": "EMEIEF TARO MIZUTORI - PROF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 14,
        "institution_id": 2,
        "name": "EMEF JOÃO DE ALMEIDA LEMOS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 15,
        "institution_id": 2,
        "name": "EMEF GILBERTO FLORÊNCIO - PROF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 16,
        "institution_id": 2,
        "name": "EMEF MARIA ELISA B. C. CHALUPPE - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 17,
        "institution_id": 2,
        "name": "EMEF MARIA ELISA B. C. CHALUPPE - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 18,
        "institution_id": 2,
        "name": "EMEIEF BENEDITO ADHERBAL FARBO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 19,
        "institution_id": 2,
        "name": "Secretaria de Educação",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 20,
        "institution_id": 2,
        "name": "EMEF NESTOR DE CAMARGO - PREF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 21,
        "institution_id": 2,
        "name": "EMEIEF BENEDITO ADHERBAL FARBO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 22,
        "institution_id": 2,
        "name": "EMEI JOÃO EVANGELISTA DE OLIVEIRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 23,
        "institution_id": 2,
        "name": "EMEF RITA DE JESUS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 24,
        "institution_id": 2,
        "name": "EMEF ELVIRA LEFÈVRE SALLES NEMER - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 25,
        "institution_id": 2,
        "name": "EMEF RITA DE JESUS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 26,
        "institution_id": 2,
        "name": "EMEIEF BENEDITO ADHERBAL FARBO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 27,
        "institution_id": 2,
        "name": "EMEF JOÃO DE ALMEIDA LEMOS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 28,
        "institution_id": 2,
        "name": "EMEF JORGE AUGUSTO DE CAMARGO - PROF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 29,
        "institution_id": 2,
        "name": "EMEF ELVIRA LEFÈVRE SALLES NEMER - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 30,
        "institution_id": 2,
        "name": "EMEF CARLOS OSMARINHO DE LIMA - PROFº",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 31,
        "institution_id": 2,
        "name": "Secretaria de Educação",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 32,
        "institution_id": 2,
        "name": "Secretaria de Educação",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 33,
        "institution_id": 2,
        "name": "EMEF JOÃO CARVALHO DE LIMA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 34,
        "institution_id": 2,
        "name": "O.S. - EMM MÁRIO BEZERRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 35,
        "institution_id": 2,
        "name": "EMEF ESTEVAN PLACÊNCIO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 36,
        "institution_id": 2,
        "name": "EMEF LEVY GONÇALVES DE OLIVEIRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 37,
        "institution_id": 2,
        "name": "EMEF ESTEVAN PLACÊNCIO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 38,
        "institution_id": 2,
        "name": "EMEF MARIA MEDUNECKAS - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 39,
        "institution_id": 2,
        "name": "EMEF JOÃO CARVALHO DE LIMA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 40,
        "institution_id": 2,
        "name": "EMEIEF JOSÉ EMIDIO DE AGUIAR",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 41,
        "institution_id": 2,
        "name": "EMEI RICARDO PEAGNO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 42,
        "institution_id": 2,
        "name": "EMEF AGENOR LINO DE MATTOS - DEP.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 43,
        "institution_id": 2,
        "name": "O.S. - MATERNAL LUZIA MARIA DA CONCEIÇÃO LIMA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 44,
        "institution_id": 2,
        "name": "EMEF NALY BENEDICTA B. C. MANCINI - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 45,
        "institution_id": 2,
        "name": "EMEF LUIZ DE OLIVEIRA ANDRADE - PE",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 46,
        "institution_id": 2,
        "name": "EMM MARIA ROSA FERREIRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 47,
        "institution_id": 2,
        "name": "EMEIEF JOSÉ EMIDIO DE AGUIAR",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 48,
        "institution_id": 2,
        "name": "EMEF LEVY GONÇALVES DE OLIVEIRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 49,
        "institution_id": 2,
        "name": "O.S. - MATERNAL MARLY TEIXEIRA DE ALMEIDA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 50,
        "institution_id": 2,
        "name": "EMM MARIA MEDUNECKAS - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 51,
        "institution_id": 2,
        "name": "EMEF NALY BENEDICTA B. C. MANCINI - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 52,
        "institution_id": 2,
        "name": "EMMEI ELIANE CASTANON PEREIRA - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 53,
        "institution_id": 2,
        "name": "EMEF BRUNO TOLAINI",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 54,
        "institution_id": 2,
        "name": "EMM ROBERTO GRITI MEDEIROS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 55,
        "institution_id": 2,
        "name": "EMEIEF YOJIRO TAKAOKA - ENG.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 56,
        "institution_id": 2,
        "name": "EMEF AMADOR AGUIAR",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 57,
        "institution_id": 2,
        "name": "EMEF ALEXANDRINO DA SILVEIRA BUENO - PROF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 58,
        "institution_id": 2,
        "name": "EMEF ARMANDO CAVAZZA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 59,
        "institution_id": 2,
        "name": "EMM ROBERTO GRITI MEDEIROS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 60,
        "institution_id": 2,
        "name": "EMEI BENEDITO VENÂNCIO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 61,
        "institution_id": 2,
        "name": "EMEI ANNA IRENE MAZARO DE FREITAS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 62,
        "institution_id": 2,
        "name": "O.S. - EMM LUZIA DAS GRAÇAS BARBOSA PEREIRA - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 63,
        "institution_id": 2,
        "name": "EMM MARIA ANDRELINA VIEIRA NASTURELES",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 64,
        "institution_id": 2,
        "name": "EMM MARIA ANDRELINA VIEIRA NASTURELES",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 65,
        "institution_id": 2,
        "name": "EMEI EMINOLDO HARGER",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 66,
        "institution_id": 2,
        "name": "EMEI EMINOLDO HARGER",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 67,
        "institution_id": 2,
        "name": "EMEF RENATO ROSA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 68,
        "institution_id": 2,
        "name": "EMEF MARLENE PEREIRA SANTIAGO - PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 69,
        "institution_id": 2,
        "name": "EMEF ALCINO FRANCISCO DE SOUZA - PROF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 70,
        "institution_id": 2,
        "name": "EMEF MARGARIDA MARIA MACIEL",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 71,
        "institution_id": 2,
        "name": "EMEF JOSÉ LEANDRO DE BARROS PIMENTEL",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 72,
        "institution_id": 2,
        "name": "EMEF EZIO BERZAGHI",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 73,
        "institution_id": 2,
        "name": "EMM JOSÉ MARTINHO COSTA PEREIRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 74,
        "institution_id": 2,
        "name": "EMEF DEIRÓ FELICIO DE ANDRADE - REV",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 75,
        "institution_id": 2,
        "name": "EMEI JOÃO FERNANDES",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 76,
        "institution_id": 2,
        "name": "EMEF JOSÉ LEANDRO DE BARROS PIMENTEL",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 77,
        "institution_id": 2,
        "name": "EMEF ARISTIDES DA COSTA E SILVA - PROF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 78,
        "institution_id": 2,
        "name": "EMEF ARISTIDES DA COSTA E SILVA - PROF.",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 79,
        "institution_id": 2,
        "name": "EMEF SIDNEY SANTUCCI - PROF",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 80,
        "institution_id": 2,
        "name": "EMEI RENALDO CRUZ - PADRE",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 81,
        "institution_id": 2,
        "name": "EMEF SIDNEY SANTUCCI - PROF",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 82,
        "institution_id": 2,
        "name": "EMEF DORIVAL FARIA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 83,
        "institution_id": 2,
        "name": "EMEIEF VEREADORA ELISABET TITTO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 84,
        "institution_id": 2,
        "name": "EMEF DALVA FOGAÇA PROFª",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 85,
        "institution_id": 2,
        "name": "EMEF ROBERTO LUÍS DE ARAÚJO BRANDÃO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 86,
        "institution_id": 2,
        "name": "EMEI THOMAZ VICTORIA RODRIGUES",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 87,
        "institution_id": 2,
        "name": "EMMEI MARIA DE MENEZES BEZERRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 88,
        "institution_id": 2,
        "name": "O.S. - MATERNAL ILDA MARTINS HOLANDA DA SILVA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 89,
        "institution_id": 2,
        "name": "EMMEI PROFª. MARIA JOSÉ DE BARROS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 90,
        "institution_id": 2,
        "name": "O.S. - MATERNAL MARIA SUELI SILVA - SUELI PROTETORA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 91,
        "institution_id": 2,
        "name": "EMM LEONARDO AUGUSTO MARCELO DOS SANTOS",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 92,
        "institution_id": 2,
        "name": "EMEF RAPOSO TAVARES",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 93,
        "institution_id": 2,
        "name": "O.S. - MATERNAL NADIR ADOLFINA PEREIRA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 94,
        "institution_id": 2,
        "name": "EMEF JULIO GOMES CAMISÃO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 95,
        "institution_id": 2,
        "name": "O.S. - MATERNAL EVELYN MOSSE BARREIRO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 96,
        "institution_id": 2,
        "name": "EMEF FRANCISCO ZACARIOTO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 97,
        "institution_id": 2,
        "name": "EMMEI MARIA DOLORES ZENDRON PENTEADO",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 98,
        "institution_id": 2,
        "name": "EMEIEF ENEIAS RAIMUNDO DA SILVA PROFº",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 99,
        "institution_id": 2,
        "name": "O.S. - MATERNAL ARACY MARTINS DE LIMA",
        "institution_name": "Prefeitura de Barueri"
    },
    {
        "id": 100,
        "institution_id": 2,
        "name": "O.S. - MATERNAL VITORIA REGIANI ASSENZA DE MOURA",
        "institution_name": "Prefeitura de Barueri"
    }
]);
}
