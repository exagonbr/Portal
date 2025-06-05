# Guia de Instalação PWA - Portal Sabercon

## Visão Geral

O sistema de instalação PWA foi melhorado para oferecer uma experiência otimizada em todas as plataformas (Web, iOS e Android).

## Componentes Disponíveis

### 1. PWAInstallPrompt (Principal)

Componente principal que detecta automaticamente a plataforma e mostra instruções específicas.

**Características:**
- Detecção automática de plataforma (iOS, Android, Desktop)
- Posicionamento responsivo
- Instruções específicas por plataforma
- Persistência de estado (não incomoda usuários que já fecharam)
- Suporte a HTTPS e HTTP com avisos apropriados

**Uso:**
```tsx
// Já está incluído no PWARegistration.tsx
<PWAInstallPrompt registration={registration} />
```

### 2. IOSInstallBanner

Banner específico para iOS que aparece no topo da página.

**Características:**
- Aparece apenas em dispositivos iOS
- Auto-oculta após instalação
- Pode ser fechado permanentemente
- Delay de 3 segundos antes de aparecer

**Uso:**
```tsx
import { IOSInstallBanner } from '@/components/IOSInstallBanner';

// Em seu layout ou página
<IOSInstallBanner />
```

### 3. PWAInstallButton

Botão versátil que pode ser usado em diferentes contextos.

**Variantes:**
- `inline`: Botão padrão para incluir em menus ou páginas
- `floating`: Botão flutuante fixo na tela
- `banner`: Banner horizontal com call-to-action

**Uso:**
```tsx
import { PWAInstallButton } from '@/components/PWAInstallButton';

// Botão inline
<PWAInstallButton variant="inline" />

// Botão flutuante
<PWAInstallButton variant="floating" position="bottom-right" />

// Banner
<PWAInstallButton variant="banner" className="mb-4" />
```

### 4. Hook usePWAInstall

Hook personalizado para gerenciar instalação programaticamente.

**Retorno:**
```typescript
{
  isInstalled: boolean;
  isInstallable: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  deferredPrompt: BeforeInstallPromptEvent | null;
  isHttps: boolean;
  canInstall: boolean;
  install: () => Promise<boolean>;
}
```

**Uso:**
```tsx
import { usePWAInstall } from '@/hooks/usePWAInstall';

function MyComponent() {
  const { isInstalled, canInstall, install, platform } = usePWAInstall();

  const handleCustomInstall = async () => {
    if (canInstall) {
      const success = await install();
      if (success) {
        console.log('App instalado com sucesso!');
      }
    }
  };

  return (
    <button onClick={handleCustomInstall}>
      Instalar App
    </button>
  );
}
```

## Posicionamento e Responsividade

### Mobile (iOS/Android)
- Botão principal posicionado acima da navegação inferior
- Ocupa largura total com margens laterais
- Instruções específicas por plataforma

### Desktop
- Botão posicionado no canto inferior direito
- Largura máxima definida
- Instruções para Chrome/Edge

## Fluxo de Instalação

### Android/Chrome Desktop
1. Detecta evento `beforeinstallprompt`
2. Mostra botão de instalação nativo
3. Ao clicar, abre prompt do navegador
4. Após instalação, oculta botão permanentemente

### iOS/Safari
1. Detecta dispositivo iOS
2. Mostra banner no topo (após 3s)
3. Exibe instruções passo a passo
4. Banner pode ser fechado permanentemente

### Outros Navegadores
1. Mostra botão com instruções genéricas
2. Modal com passos específicos do navegador

## Configurações do Manifest

O `manifest.json` foi otimizado com:
- Múltiplos tamanhos de ícones (72px a 512px)
- Screenshots para desktop e mobile
- Atalhos para funcionalidades principais
- Suporte a file handlers
- Display modes progressivos

## Persistência de Estado

O sistema salva no localStorage:
- `pwa-installed`: Marca quando o app foi instalado
- `pwa-prompt-interacted`: Marca quando usuário interagiu com prompt
- `ios-install-banner-dismissed`: Marca quando banner iOS foi fechado

## Melhores Práticas

1. **Não seja intrusivo**: O prompt aparece de forma sutil e pode ser fechado
2. **Instruções claras**: Cada plataforma tem suas instruções específicas
3. **Feedback visual**: Animações suaves e transições
4. **Acessibilidade**: Todos os botões têm aria-labels apropriados
5. **Performance**: Componentes são lazy-loaded quando necessário

## Troubleshooting

### Prompt não aparece
- Verifique se está usando HTTPS
- Confirme que o manifest.json está correto
- Teste em aba anônima (sem extensões)

### iOS não mostra banner
- Verifique detecção de user agent
- Confirme que não está em modo standalone
- Limpe localStorage para resetar estado

### Instalação falha
- Verifique console para erros
- Confirme que service worker está registrado
- Teste em diferentes navegadores 