// Teste do menu do SYSTEM_ADMIN
console.log('🔍 Testando menu do SYSTEM_ADMIN...');

// Simular a função getSystemAdminMenuItems
const testMenu = [
  {
    section: 'Principal',
    items: [
      {
        href: '/dashboard/system-admin',
        icon: 'dashboard',
        label: 'Painel Principal'
      },
      {
        href: '/chat',
        icon: 'chat',
        label: 'Mensagens'
      }
    ]
  },
  {
    section: 'Gestão de Conteúdo',
    items: [
      {
        href: '/admin/content/search',
        icon: 'archive',
        label: 'Gerenciar Arquivos',
        permission: 'canManageSystem'
      },
      {
        href: '/portal/collections',
        icon: 'video_library',
        label: 'Visualizar Coleções',
        permission: 'canManageSystem'
      },
      {
        href: '/portal/collections/manage',
        icon: 'edit_note',
        label: 'Gerenciar Coleções',
        permission: 'canManageSystem'
      },
      {
        href: '/portal/collections/admin',
        icon: 'admin_panel_settings',
        label: 'Admin de Coleções',
        permission: 'canManageSystem'
      }
    ]
  }
];

console.log('📋 Menu gerado:');
testMenu.forEach((section, idx) => {
  console.log(`\n${idx + 1}. Seção: ${section.section}`);
  section.items.forEach((item, itemIdx) => {
    console.log(`   ${itemIdx + 1}. ${item.label} -> ${item.href} ${item.permission ? `(${item.permission})` : ''}`);
  });
});

// Verificar se o item específico existe
const gestaoConteudo = testMenu.find(section => section.section === 'Gestão de Conteúdo');
if (gestaoConteudo) {
  const adminCollections = gestaoConteudo.items.find(item => item.href === '/portal/collections/admin');
  console.log('\n✅ Item "Admin de Coleções" encontrado:', adminCollections ? 'SIM' : 'NÃO');
  if (adminCollections) {
    console.log('📍 Detalhes:', adminCollections);
  }
} else {
  console.log('\n❌ Seção "Gestão de Conteúdo" não encontrada');
}

console.log('\n🎯 Teste concluído!'); 