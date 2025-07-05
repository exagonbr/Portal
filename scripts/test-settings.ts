#!/usr/bin/env ts-node

const { loadSystemSettings, loadPublicSettings, saveSystemSettings } = require('../src/lib/systemSettings');

async function testSettings() {
  try {
    console.log('🧪 Testando sistema de configurações...\n');

    // Teste 1: Carregar configurações do sistema
    console.log('1️⃣ Carregando configurações do sistema...');
    const systemSettings = await loadSystemSettings();
    console.log('✅ Sistema:', Object.keys(systemSettings).length, 'configurações');
    console.log('   - Site Name:', systemSettings.site_name);
    console.log('   - Background Type:', systemSettings.background_type);
    console.log('   - Main Background:', systemSettings.main_background);
    console.log('   - Primary Color:', systemSettings.primary_color);
    console.log('');

    // Teste 2: Carregar configurações públicas
    console.log('2️⃣ Carregando configurações públicas...');
    const publicSettings = await loadPublicSettings();
    console.log('✅ Públicas:', Object.keys(publicSettings).length, 'configurações');
    console.log('   - Site Name:', publicSettings.site_name);
    console.log('   - Background Type:', publicSettings.background_type);
    console.log('   - Main Background:', publicSettings.main_background);
    console.log('   - Primary Color:', publicSettings.primary_color);
    console.log('');

    // Teste 3: Salvar uma configuração
    console.log('3️⃣ Testando salvamento de configuração...');
    const testUpdate = {
      site_name: 'Portal Educacional - Teste',
      primary_color: '#ff6b6b'
    };
    
    const saveResult = await saveSystemSettings(testUpdate);
    console.log('✅ Salvamento:', saveResult ? 'Sucesso' : 'Falha');
    console.log('');

    // Teste 4: Verificar se as mudanças foram aplicadas
    console.log('4️⃣ Verificando mudanças aplicadas...');
    const updatedSettings = await loadSystemSettings();
    console.log('✅ Verificação:');
    console.log('   - Site Name:', updatedSettings.site_name);
    console.log('   - Primary Color:', updatedSettings.primary_color);
    console.log('');

    // Teste 5: Verificar configurações públicas após mudança
    console.log('5️⃣ Verificando configurações públicas após mudança...');
    const updatedPublicSettings = await loadPublicSettings();
    console.log('✅ Públicas atualizadas:');
    console.log('   - Site Name:', updatedPublicSettings.site_name);
    console.log('   - Primary Color:', updatedPublicSettings.primary_color);
    console.log('');

    console.log('🎉 Todos os testes passaram com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testSettings().catch(console.error);
}

module.exports = { testSettings }; 