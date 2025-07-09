const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

// Dados de teste para atualização de uma instituição
const updateData = {
  name: "Instituição Teste Atualizada",
  company_name: "Empresa Teste LTDA Atualizada",
  document: "12.345.678/0001-99",
  accountable_name: "João Silva Santos",
  accountable_contact: "joao.silva@teste.com",
  code: "INST-TESTE-001",
  description: "Descrição atualizada da instituição de teste",
  email: "contato.atualizado@instituicao-teste.edu.br",
  phone: "(11) 98765-4321",
  website: "https://www.instituicao-teste-atualizada.edu.br",
  street: "Rua das Flores Atualizadas, 123",
  complement: "Sala 101",
  district: "Centro Atualizado",
  city: "São Paulo",
  state: "SP",
  postal_code: "01234-567",
  contract_num: 987654,
  contract_invoice_num: "FAT-2024-002",
  contract_term_start: "2024-01-01",
  contract_term_end: "2025-12-31",
  contract_disabled: false,
  has_library_platform: true,
  has_principal_platform: true,
  has_student_platform: false,
  score: 85,
  type: "UNIVERSITY",
  is_active: true
};

async function testInstitutionPUT() {
  console.log('🧪 Iniciando testes do PUT para instituições...\n');

  try {
    // 1. Primeiro, vamos listar as instituições para encontrar uma existente
    console.log('📋 1. Buscando instituições existentes...');
    const listResponse = await fetch(`${API_BASE}/institutions?page=1&limit=5`);
    const listData = await listResponse.json();
    
    console.log(`Status da listagem: ${listResponse.status}`);
    console.log(`Total de instituições: ${listData.total || 0}`);
    
    if (!listData.items || listData.items.length === 0) {
      console.log('⚠️  Nenhuma instituição encontrada. Vamos criar uma primeiro...\n');
      
      // Criar uma instituição para testar
      console.log('➕ Criando uma instituição para teste...');
      const createResponse = await fetch(`${API_BASE}/institutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Instituição Teste Original",
          company_name: "Empresa Teste LTDA",
          document: "11.222.333/0001-88",
          accountable_name: "Maria Silva",
          accountable_contact: "maria@teste.com",
          street: "Rua Original, 100",
          district: "Centro",
          city: "São Paulo",
          state: "SP",
          postal_code: "01111-111",
          contract_term_start: "2024-01-01",
          contract_term_end: "2024-12-31",
          type: "SCHOOL"
        })
      });
      
      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log('✅ Instituição criada com sucesso!');
        console.log(`ID: ${createData.data?.id || createData.id}`);
        
        // Usar a instituição recém-criada
        var institutionId = createData.data?.id || createData.id;
      } else {
        console.log('❌ Erro ao criar instituição:', await createResponse.text());
        return;
      }
    } else {
      // Usar a primeira instituição da lista
      var institutionId = listData.items[0].id;
      console.log(`✅ Usando instituição existente: ID ${institutionId}`);
    }

    console.log('\n📝 2. Testando atualização (PUT)...');
    
    // 2. Testar o PUT
    const putResponse = await fetch(`${API_BASE}/institutions/${institutionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    console.log(`Status do PUT: ${putResponse.status}`);
    
    if (putResponse.ok) {
      const putData = await putResponse.json();
      console.log('✅ PUT realizado com sucesso!');
      console.log('📋 Dados retornados:');
      console.log(JSON.stringify(putData, null, 2));
    } else {
      const errorText = await putResponse.text();
      console.log('❌ Erro no PUT:');
      console.log(`Status: ${putResponse.status}`);
      console.log(`Erro: ${errorText}`);
    }

    console.log('\n🔍 3. Verificando se os dados foram atualizados...');
    
    // 3. Verificar se os dados foram realmente atualizados
    const getResponse = await fetch(`${API_BASE}/institutions/${institutionId}`);
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      const institution = getData.data || getData;
      
      console.log('✅ Dados atuais da instituição:');
      console.log(`Nome: ${institution.name}`);
      console.log(`Empresa: ${institution.company_name}`);
      console.log(`CNPJ: ${institution.document}`);
      console.log(`Responsável: ${institution.accountable_name}`);
      console.log(`Contato: ${institution.accountable_contact}`);
      console.log(`Endereço: ${institution.street}, ${institution.district}, ${institution.city}/${institution.state}`);
      console.log(`CEP: ${institution.postal_code}`);
      console.log(`Contrato: ${institution.contract_num} (${institution.contract_term_start} - ${institution.contract_term_end})`);
      console.log(`Plataformas: Biblioteca=${institution.has_library_platform}, Diretor=${institution.has_principal_platform}, Estudante=${institution.has_student_platform}`);
      console.log(`Score: ${institution.score}`);
      console.log(`Ativo: ${institution.is_active}`);
      
      // Verificar se alguns campos específicos foram atualizados
      const fieldsToCheck = [
        'name', 'company_name', 'document', 'accountable_name', 
        'accountable_contact', 'street', 'district', 'score'
      ];
      
      let successCount = 0;
      console.log('\n🔍 Verificação de campos atualizados:');
      
      fieldsToCheck.forEach(field => {
        if (institution[field] === updateData[field]) {
          console.log(`✅ ${field}: ${institution[field]}`);
          successCount++;
        } else {
          console.log(`❌ ${field}: Esperado "${updateData[field]}", obtido "${institution[field]}"`);
        }
      });
      
      console.log(`\n📊 Resultado: ${successCount}/${fieldsToCheck.length} campos atualizados corretamente`);
      
      if (successCount === fieldsToCheck.length) {
        console.log('🎉 TESTE PASSOU! Todos os campos foram atualizados corretamente.');
      } else {
        console.log('⚠️  TESTE PARCIAL! Alguns campos não foram atualizados.');
      }
      
    } else {
      console.log('❌ Erro ao buscar instituição atualizada:', await getResponse.text());
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar o teste
testInstitutionPUT(); 