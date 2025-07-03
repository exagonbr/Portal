// Teste simples para verificar se o QuillEditor funciona sem erros de findDOMNode
const puppeteer = require('puppeteer');

async function testQuillEditor() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capturar erros do console
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    // Navegar para a página de teste
    await page.goto('http://localhost:3000/quill-test', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Aguardar o editor carregar
    await page.waitForTimeout(5000);
    
    // Verificar se há erros relacionados ao findDOMNode
    const findDOMNodeErrors = errors.filter(error => 
      error.includes('findDOMNode') || error.includes('react_dom_1.default.findDOMNode')
    );
    
    if (findDOMNodeErrors.length === 0) {
      console.log('✅ SUCESSO: Nenhum erro de findDOMNode encontrado!');
      console.log('✅ O QuillEditor está funcionando corretamente com React 18');
    } else {
      console.log('❌ ERRO: Ainda há erros de findDOMNode:');
      findDOMNodeErrors.forEach(error => console.log('  -', error));
    }
    
    // Mostrar todos os erros capturados (se houver)
    if (errors.length > 0) {
      console.log('\n📋 Todos os erros capturados:');
      errors.forEach(error => console.log('  -', error));
    } else {
      console.log('\n✅ Nenhum erro de console detectado!');
    }
    
  } catch (error) {
    console.log('❌ Erro ao executar o teste:', error.message);
  } finally {
    await browser.close();
  }
}

testQuillEditor();