# Configurações de Plano de Fundo - Portal Educacional

## Funcionalidades Implementadas

### 1. Hook useSystemSettings
- **Localização**: `src/hooks/useSystemSettings.ts`
- **Função**: Gerenciar configurações gerais do sistema, incluindo plano de fundo
- **Armazenamento**: LocalStorage (pode ser facilmente migrado para banco de dados)

### 2. Página de Configurações Atualizada
- **Localização**: `src/app/admin/settings/page.tsx`
- **Novas funcionalidades**:
  - Seleção de tipo de plano de fundo (Vídeo, URL Externa, Cor Sólida)
  - Lista de vídeos disponíveis na pasta public
  - Campo para URL personalizada
  - Seletor de cores com paleta pré-definida
  - Controle de opacidade (10% a 100%)
  - Toggle para overlay escuro
  - Preview em tempo real

### 3. Página de Login Atualizada
- **Localização**: `src/app/login/page.tsx`
- **Funcionalidades**:
  - Carregamento dinâmico do plano de fundo baseado nas configurações
  - Suporte a vídeos (.mp4, .webm, .ogg)
  - Suporte a imagens via URL
  - Suporte a cores sólidas
  - Aplicação de opacidade e overlay conforme configurado

## Tipos de Plano de Fundo Suportados

### 1. Vídeo Local
- **Vídeos disponíveis**:
  - `/back_video.mp4`
  - `/back_video1.mp4`
  - `/back_video2.mp4`
  - `/back_video3.mp4`
  - `/back_video4.mp4`
- **Formato**: MP4 (autoplay, loop, muted)

### 2. URL Externa
- **Formatos suportados**:
  - Vídeos: `.mp4`, `.webm`, `.ogg`
  - Imagens: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- **Requisitos**: URL deve ser acessível publicamente e suportar CORS

### 3. Cor Sólida
- **Seletor de cores**: Color picker nativo do browser
- **Paleta pré-definida**: 6 cores acadêmicas
- **Formato**: Hexadecimal (#RRGGBB)

## Configurações Avançadas

### Opacidade
- **Range**: 10% a 100%
- **Incremento**: 10%
- **Aplicação**: Todos os tipos de plano de fundo

### Overlay Escuro
- **Função**: Melhora a legibilidade do texto
- **Opacidade**: 20% (bg-black/20)
- **Aplicação**: Opcional para todos os tipos

## Preview em Tempo Real

### Localização
- **Sidebar**: Página de configurações
- **Dimensões**: 32 unidades de altura (Tailwind h-32)
- **Conteúdo**: Simulação do formulário de login

### Informações Exibidas
- Tipo de plano de fundo atual
- Valor (caminho do vídeo, URL ou cor)
- Nível de opacidade

## Como Usar

### Para Administradores
1. Acesse `Configurações > Sistema`
2. Na seção "Plano de Fundo do Login":
   - Selecione o tipo desejado
   - Configure o valor específico
   - Ajuste opacidade e overlay
   - Visualize no preview
3. Clique em "Salvar Alterações"

### Para Desenvolvedores
```typescript
// Importar o hook
import { useSystemSettings } from '@/hooks/useSystemSettings'

// Usar no componente
const { settings, updateLoginBackground } = useSystemSettings()

// Acessar configurações de plano de fundo
const backgroundConfig = settings.loginBackground
// { type: 'video', value: '/back_video4.mp4', opacity: 100, overlay: false }

// Atualizar configurações
updateLoginBackground({ 
  type: 'color', 
  value: '#1e3a8a',
  opacity: 80,
  overlay: true 
})
```

## Estrutura de Dados

```typescript
interface BackgroundSettings {
  type: 'video' | 'url' | 'color'
  value: string              // Caminho, URL ou cor
  opacity?: number           // 10-100
  overlay?: boolean          // true/false
}
```

## Migração para Banco de Dados

Para migrar do localStorage para banco de dados:

1. Criar tabela `system_settings`
2. Adicionar endpoints API para CRUD
3. Atualizar o hook `useSystemSettings`
4. Implementar sincronização com servidor

## Compatibilidade

- **Navegadores**: Modernos com suporte a CSS Grid, Video HTML5
- **Responsivo**: Adaptado para mobile e desktop
- **Acessibilidade**: Labels adequados, controles de teclado
- **Performance**: Lazy loading, otimização de vídeos 