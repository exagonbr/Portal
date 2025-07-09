# Solução Definitiva para o Erro "reading 'call'" em Dispositivos Móveis

## Problema Resolvido

Este documento descreve a solução definitiva implementada para resolver o erro:

```
Cannot read properties of undefined (reading 'call')
```

Este erro ocorria principalmente em dispositivos móveis quando o webpack tentava carregar chunks dinâmicos e o `originalFactory` estava indefinido.

## Causas do Problema

1. **Carregamento de Chunks**: O Next.js/webpack divide o código em chunks para carregamento sob demanda
2. **Conexões Móveis**: Em dispositivos móveis, conexões instáveis causam falhas no carregamento de chunks
3. **Cache Problemático**: O cache do navegador às vezes armazena versões incompatíveis dos chunks
4. **Factory Undefined**: O webpack tenta chamar `originalFactory.call()` quando o factory está undefined

## Solução Implementada

### 1. Otimização do Webpack (next.config.js)

- **Split Chunks Otimizado**: Configuração específica para separar código em chunks menores e mais gerenciáveis
- **Timeout Estendido**: Aumentado para 120 segundos para dar mais tempo ao carregamento em conexões lentas
- **ChunkIds Determinísticos**: Para garantir consistência entre builds
- **Minimização Robusta**: Configuração do Terser para preservar nomes de funções e classes

### 2. Handler Específico para Dispositivos Móveis (chunk-config.js)

- **Detecção de Dispositivo**: Identificação automática de dispositivos móveis
- **Interceptação de Erros**: Captura específica do erro "reading 'call'"
- **Recarregamento Imediato**: Em dispositivos móveis, recarrega a página imediatamente quando o erro ocorre
- **Cache Bust**: Adiciona parâmetro de timestamp para evitar uso de cache problemático
- **Limpeza de Cache**: Remove caches locais antes de recarregar

### 3. Melhorias no Service Worker

- **Retry Automático**: Tentativas múltiplas para carregar chunks que falharam
- **Cache Inteligente**: Estratégias diferentes para diferentes tipos de recursos
- **Detecção de Erros**: Identificação específica de erros de chunk

### 4. Tratamento de Erros Aprimorado (chunk-error-handler.ts)

- **Detecção Ampliada**: Reconhecimento de diferentes variantes do erro "reading 'call'"
- **Tratamento Específico para Mobile**: Lógica especial para dispositivos móveis
- **Limpeza de Cache**: Remove caches problemáticos antes de recarregar

## Como Aplicar a Solução

Execute o script de correção automática:

```bash
node scripts/fix-chunk-errors.js
```

Este script:
1. Atualiza o `next.config.js` com configurações otimizadas
2. Cria/atualiza o `chunk-config.js` com tratamento específico para mobile
3. Garante que o script é carregado no `_document.tsx`
4. Limpa caches de build para garantir uma compilação limpa

## Testando a Solução

Após aplicar as correções:

1. Execute o build da aplicação: `npm run build`
2. Inicie a aplicação: `npm start`
3. Teste em diferentes dispositivos móveis e navegadores

## Monitoramento

Para verificar se a solução está funcionando:

1. Monitore o console do navegador em dispositivos móveis
2. Verifique se o log "Configuração de chunks carregada (otimizada para mobile)" aparece
3. Observe se não há mais erros de "reading 'call'"

---

*Documentação criada em: [DATA_ATUAL]* 