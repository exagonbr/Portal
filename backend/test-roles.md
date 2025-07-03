# Guia de Testes - Sistema de Roles

## 🧪 Como Testar o Sistema

### 1. **Iniciar o Backend**
```bash
cd backend
npm install
npm run dev
```

### 2. **Executar o Script de Atribuição**
```bash
# Atribuir role TEACHER aos usuários importados
npm run assign-teacher-role
```

### 3. **Testar APIs com cURL**

#### a) Obter estatísticas:
```bash
curl -X GET http://localhost:3001/api/roles/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### b) Listar roles:
```bash
curl -X GET http://localhost:3001/api/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### c) Dados para frontend:
```bash
curl -X GET http://localhost:3001/api/roles/frontend \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### d) Grupos de permissões:
```bash
curl -X GET http://localhost:3001/api/roles/permission-groups \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. **Testar Frontend**
```bash
cd ../ # voltar para raiz
npm run dev
# Navegar para http://localhost:3000/admin/roles
```

## ✅ Resultados Esperados

1. ✅ Script executa sem erros
2. ✅ APIs retornam dados JSON válidos
3. ✅ Frontend carrega roles e permissões
4. ✅ Usuários importados têm role TEACHER
5. ✅ Interface permite criar roles personalizadas

## 🎯 Status: SISTEMA FUNCIONAL!

O sistema completo de roles está implementado e pronto para uso. 