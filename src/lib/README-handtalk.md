# Integração com Handtalk

Este documento explica como implementar o Handtalk para acessibilidade em Língua Brasileira de Sinais (LIBRAS) em todo o sistema.

## O que é Handtalk?

Handtalk é uma solução de acessibilidade que permite a tradução automática de conteúdo de texto para LIBRAS, tornando seu site ou aplicação acessível para pessoas surdas ou com deficiência auditiva.

## Como configurar

1. Obtenha seu token de acesso na [plataforma Handtalk](https://www.handtalk.me/).

2. Substitua o token no arquivo `src/lib/examples/handtalkExample.ts`:
   ```typescript
   const HANDTALK_TOKEN = 'SEU_TOKEN_AQUI';
   ```

3. Inicialize o Handtalk no componente raiz da sua aplicação:

### Para aplicações Next.js

No arquivo `_app.tsx` ou `layout.tsx`:

```typescript
import { useEffect } from 'react';
import { initializeHandtalk } from '@/lib/examples/handtalkExample';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Inicializa o Handtalk apenas no lado do cliente
    initializeHandtalk();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### Para aplicações React convencionais

Você tem duas opções:

#### Opção 1: Usando o componente Handtalk

```typescript
import Handtalk from '@/components/Handtalk';

function App() {
  return (
    <div className="App">
      <Handtalk token="SEU_TOKEN_AQUI" />
      {/* ... conteúdo da aplicação ... */}
    </div>
  );
}
```

#### Opção 2: Inicializando diretamente no componente raiz

```typescript
import { useEffect } from 'react';
import { HT } from './lib/handtalk';

function App() {
  useEffect(() => {
    // Inicializa o Handtalk
    HT.getInstance({ token: 'SEU_TOKEN_AQUI' });
  }, []);

  return (
    <div className="App">
      {/* ... conteúdo da aplicação ... */}
    </div>
  );
}
```

## Como funciona

A implementação utiliza o padrão Singleton para garantir que apenas uma instância do Handtalk seja criada, independente de quantas vezes a função de inicialização seja chamada.

O script do Handtalk é carregado dinamicamente, o que significa que:
1. Não é necessário adicionar o script no HTML manualmente
2. O script é carregado assincronamente sem bloquear o carregamento da página
3. Se o script já estiver carregado, ele não será carregado novamente

## Funcionalidades

- Carregamento dinâmico do script Handtalk
- Padrão Singleton para evitar múltiplas instâncias
- Verificação de inicialização através do método `isInitialized()`
- Tratamento de erros para falhas no carregamento
- Compatibilidade com ambientes server-side (SSR)
- Componente React pronto para uso (`<Handtalk token="SEU_TOKEN" />`)

## Suporte e problemas comuns

- Se o ícone do Handtalk não aparecer, verifique se o token está correto
- Em caso de erros, verifique o console do navegador para mensagens detalhadas
- Certifique-se de que o site está acessível publicamente para que o serviço Handtalk funcione corretamente 