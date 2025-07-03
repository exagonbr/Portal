# 🧪 Guia de Teste - KoodoViewer

## Como Testar se Está FUNCIONAL E IDÊNTICO

### 📋 Checklist de Testes

#### 1. Teste de Abertura de Livros
- [ ] **PDF**: Clique em um livro PDF - deve abrir instantaneamente
- [ ] **EPUB**: Clique em um livro EPUB - deve carregar e renderizar
- [ ] **Erro**: Teste com arquivo inexistente - deve mostrar erro elegante
- [ ] **Loading**: Observe o spinner durante carregamento

#### 2. Teste de Navegação  
- [ ] **Botões ←/→**: Devem funcionar para navegar páginas
- [ ] **Input numérico**: Digite um número - deve pular para a página
- [ ] **Primeira/Última**: Teste limites (página 1 e última)
- [ ] **Teclado**: Setas do teclado devem funcionar

#### 3. Teste de Zoom
- [ ] **Botão +**: Deve aumentar zoom (50% - 300%)
- [ ] **Botão -**: Deve diminuir zoom 
- [ ] **Display %**: Deve mostrar porcentagem atual
- [ ] **PDF**: Zoom deve afetar tamanho da página
- [ ] **EPUB**: Zoom deve afetar tamanho da fonte

#### 4. Teste de Modos de Leitura
- [ ] **📄 Single**: Uma página por vez
- [ ] **📖 Double**: Duas páginas lado a lado (se aplicável)
- [ ] **📜 Scroll**: Rolagem contínua
- [ ] **Mudança**: Deve alternar entre modos corretamente

#### 5. Teste de Temas
- [ ] **🌙 Dark**: Deve aplicar tema escuro
- [ ] **☀️ Light**: Deve voltar ao tema claro
- [ ] **EPUB**: Deve mudar cor do texto/fundo no conteúdo
- [ ] **Interface**: Controles devem mudar de cor

#### 6. Teste de Tela Cheia
- [ ] **🖥️ Entrar**: Deve entrar em modo fullscreen
- [ ] **📱 Sair**: Deve sair do fullscreen
- [ ] **ESC**: Tecla ESC deve sair do fullscreen
- [ ] **Interface**: Controles devem permanecer visíveis

#### 7. Teste de Persistência
- [ ] **Posição**: Feche e reabra o livro - deve voltar à mesma página
- [ ] **Zoom**: Configuração de zoom deve ser mantida
- [ ] **Tema**: Tema escolhido deve ser lembrado
- [ ] **Modo**: Modo de leitura deve persistir

#### 8. Teste de Progress
- [ ] **Barra**: Deve mostrar progresso visual na parte inferior
- [ ] **Timer**: Deve contar tempo de leitura
- [ ] **Informações**: Deve mostrar "Xh Ym lendo" no cabeçalho

#### 9. Teste de Interface
- [ ] **Responsivo**: Deve funcionar em diferentes tamanhos de tela
- [ ] **Botão Voltar**: Deve retornar à lista de livros
- [ ] **Informações**: Deve mostrar título e autor do livro
- [ ] **Loading**: Estados de carregamento devem ser claros

#### 10. Teste de Performance
- [ ] **Velocidade**: Abertura deve ser rápida
- [ ] **Memória**: Não deve vazar memória ao fechar
- [ ] **CPU**: Não deve consumir CPU desnecessariamente
- [ ] **Smooth**: Animações devem ser suaves

## 🔍 Verificações Específicas

### localStorage (Abra DevTools > Application > Local Storage)
Deve conter:
```
koodo-reader-scale: "1.2"
koodo-reader-readerMode: "single" 
koodo-reader-isDarkMode: "no"
koodo-book-{id}-recordLocation: {"page":5,"percentage":25}
koodo-book-{id}-readingTime: 120
```

### CSS Aplicado (DevTools > Elements)
Deve ter:
```html
<div class="koodo-viewer">
  <div class="koodo-controls">
  <div class="koodo-content">
  <div class="koodo-progress">
```

### Console Logs
Deve mostrar:
```
🔄 Inicializando PDF: /books/sample.pdf
✅ PDF carregado: 25 páginas
📖 Abrindo livro com KoodoViewer: {...}
```

## 🚨 Red Flags (Problemas)

❌ **NÃO deve acontecer:**
- Tela branca ao abrir livro
- Erros no console
- Navegação travada
- Zoom não funcionando
- Configurações não salvando
- Performance lenta
- Layout quebrado

## ✅ Success Criteria (Funcionando)

✅ **Deve acontecer:**
- Abertura instantânea
- Navegação fluida
- Zoom responsivo
- Persistência automática
- Interface limpa
- Performance boa
- Comportamento idêntico ao koodo-reader

## 🎯 Teste Comparativo

Para verificar se está **IDÊNTICO** ao koodo-reader:

1. **Abra o Koodo Reader original**: https://reader.960960.xyz
2. **Abra o KoodoViewer**: Seu projeto
3. **Compare lado a lado**:
   - Layout dos controles
   - Funcionalidade de navegação
   - Comportamento do zoom
   - Troca de temas
   - Velocidade de resposta

## 📱 Teste em Dispositivos

- [ ] **Desktop**: Chrome, Firefox, Safari, Edge
- [ ] **Mobile**: iOS Safari, Android Chrome
- [ ] **Tablet**: iPad, Android tablet
- [ ] **Touch**: Gestos de toque devem funcionar

## 🛠️ Debug Comum

### Problema: PDF não abre
```bash
# Verificar se o arquivo existe
curl -I https://portal.sabercon.com.br/books/sample.pdf
```

### Problema: EPUB não renderiza
```javascript
// Console do navegador
document.querySelector('#page-area') // Deve existir
```

### Problema: Configurações não salvam
```javascript
// Console do navegador  
localStorage.getItem('koodo-reader-scale') // Deve ter valor
```

## 🎉 Sucesso!

Se todos os testes passarem, você tem uma implementação **FUNCIONAL E IDÊNTICA** ao Koodo Reader! 🚀

### Como Saber se Está Funcionando Perfeitamente:

1. ✅ Livros abrem sem erro
2. ✅ Navegação é fluida  
3. ✅ Zoom funciona perfeitamente
4. ✅ Temas aplicam corretamente
5. ✅ Posição é sempre lembrada
6. ✅ Interface é responsiva
7. ✅ Performance é boa
8. ✅ Comportamento é idêntico ao koodo-reader

**Parabéns! Você tem o KoodoViewer funcionando perfeitamente!** 🎊 