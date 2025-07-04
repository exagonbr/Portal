/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('themes').del()
  await knex('themes').insert([
    {
      id: 1,
      name: 'Meio Ambiente',
      description: 'Temas relacionados à natureza, ecologia e sustentabilidade',
      color_primary: '#4CAF50',
      color_secondary: '#81C784',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Ciências e Tecnologia',
      description: 'Temas relacionados a ciências, tecnologia e inovação',
      color_primary: '#2196F3',
      color_secondary: '#64B5F6',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'História e Cultura',
      description: 'Temas relacionados à história, cultura e sociedade',
      color_primary: '#FF9800',
      color_secondary: '#FFB74D',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Artes e Literatura',
      description: 'Temas relacionados a artes, literatura e expressão criativa',
      color_primary: '#E91E63',
      color_secondary: '#F06292',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'Matemática e Lógica',
      description: 'Temas relacionados a matemática, lógica e raciocínio',
      color_primary: '#9C27B0',
      color_secondary: '#BA68C8',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      name: 'Esportes e Saúde',
      description: 'Temas relacionados a esportes, saúde e bem-estar',
      color_primary: '#F44336',
      color_secondary: '#EF5350',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};