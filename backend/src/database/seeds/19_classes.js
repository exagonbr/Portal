'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Busca a primeira unidade e os ciclos educacionais
  const unit = await knex('unit').first();
  const cycles = await knex('education_cycles').select('id', 'code');
  
  if (!unit || cycles.length === 0) {
    console.log('Unidade ou ciclos educacionais não encontrados. Pulando seed de turmas.');
    return;
  }

  // Deleta todos os registros existentes
  await knex('classes').del();
  
  const classes = [];
  const currentYear = new Date().getFullYear();
  
  // Cria turmas para cada ciclo
  cycles.forEach(cycle => {
    let turmasPerCycle = [];
    
    switch(cycle.code) {
      case 'EI': // Educação Infantil
        turmasPerCycle = [
          { name: 'Berçário I', code: 'BER1', year_level: 1 },
          { name: 'Berçário II', code: 'BER2', year_level: 2 },
          { name: 'Maternal I', code: 'MAT1', year_level: 3 },
          { name: 'Maternal II', code: 'MAT2', year_level: 4 },
          { name: 'Pré-Escola', code: 'PRE', year_level: 5 }
        ];
        break;
        
      case 'EF1': // Ensino Fundamental I
        turmasPerCycle = [
          { name: '1º Ano', code: '1ANO', year_level: 1 },
          { name: '2º Ano', code: '2ANO', year_level: 2 },
          { name: '3º Ano', code: '3ANO', year_level: 3 },
          { name: '4º Ano', code: '4ANO', year_level: 4 },
          { name: '5º Ano', code: '5ANO', year_level: 5 }
        ];
        break;
        
      case 'EF2': // Ensino Fundamental II
        turmasPerCycle = [
          { name: '6º Ano', code: '6ANO', year_level: 6 },
          { name: '7º Ano', code: '7ANO', year_level: 7 },
          { name: '8º Ano', code: '8ANO', year_level: 8 },
          { name: '9º Ano', code: '9ANO', year_level: 9 }
        ];
        break;
        
      case 'EM': // Ensino Médio
        turmasPerCycle = [
          { name: '1ª Série', code: '1SER', year_level: 1 },
          { name: '2ª Série', code: '2SER', year_level: 2 },
          { name: '3ª Série', code: '3SER', year_level: 3 }
        ];
        break;
        
      case 'EJA': // Educação de Jovens e Adultos
        turmasPerCycle = [
          { name: 'EJA Fundamental', code: 'EJAF', year_level: 1 },
          { name: 'EJA Médio', code: 'EJAM', year_level: 2 }
        ];
        break;
        
      case 'ET': // Ensino Técnico
        turmasPerCycle = [
          { name: 'Técnico em Informática', code: 'TINF', year_level: 1 },
          { name: 'Técnico em Administração', code: 'TADM', year_level: 1 },
          { name: 'Técnico em Enfermagem', code: 'TENF', year_level: 1 }
        ];
        break;
    }
    
    // Cria múltiplas turmas para cada ano/série (A, B, C)
    turmasPerCycle.forEach((turmaBase, index) => {
      ['A', 'B', 'C'].forEach(letra => {
        classes.push({
          name: `${turmaBase.name} - Turma ${letra}`,
          code: `${turmaBase.code}${letra}${currentYear}`,
          description: `Turma ${letra} do ${turmaBase.name} - ${currentYear}`,
          year: currentYear,
          semester: 1,
          max_students: 30,
          current_students: 0,
          unit_id: unit.id,
          education_cycle_id: cycle.id,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    });
  });
  
  // Insere as turmas
  if (classes.length > 0) {
    await knex('classes').insert(classes);
  }
};