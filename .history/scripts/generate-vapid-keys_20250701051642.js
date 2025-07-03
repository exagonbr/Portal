const webpush = require('web-push');

console.log('\n=== Gerador de Chaves VAPID para Push Notifications ===\n');

try {
  // Generate VAPID keys
  const vapidKeys = webpush.generateVAPIDKeys();

  console.log('✅ Chaves VAPID geradas com sucesso!\n');

  console.log('📋 Adicione estas variáveis ao seu arquivo .env do BACKEND:\n');
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  console.log('VAPID_EMAIL=your_email@example.com  # Substitua pelo seu email\n');

  console.log('📋 Adicione esta variável ao seu arquivo .env.local do FRONTEND:\n');
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`);

  console.log('⚠️  IMPORTANTE:');
  console.log('- Mantenha a chave privada (VAPID_PRIVATE_KEY) segura');
  console.log('- Não compartilhe a chave privada publicamente');
  console.log('- A chave pública pode ser usada no frontend');
  console.log('- Substitua "your_email@example.com" pelo seu email real\n');

  console.log('🔧 Próximos passos:');
  console.log('1. Copie as variáveis para os arquivos .env apropriados');
  console.log('2. Reinicie o servidor backend');
  console.log('3. Reinicie o servidor frontend');
  console.log('4. Teste as push notifications em /notifications/send\n');

} catch (error) {
  console.log('❌ Erro ao gerar chaves VAPID:', error);
  console.log('\n💡 Certifique-se de que o web-push está instalado:');
  console.log('npm install web-push');
}
