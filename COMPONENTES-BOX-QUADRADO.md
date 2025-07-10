# 📦 Componentes de Box Quadrado Centralizado

Este documento descreve os componentes criados para exibir boxes quadrados perfeitamente centralizados na tela.

## 🎯 Componentes Disponíveis

### 1. `CenteredSquareBox` - Box Quadrado Pré-definido
- **Arquivo**: `src/components/ui/CenteredSquareBox.tsx`
- **Propósito**: Box quadrado com tamanhos pré-definidos
- **Ideal para**: Modais, alertas, cards de destaque

### 2. `FlexibleSquareBox` - Box Quadrado Customizável
- **Arquivo**: `src/components/ui/FlexibleSquareBox.tsx`
- **Propósito**: Box quadrado com dimensões totalmente customizáveis
- **Ideal para**: Casos específicos que precisam de tamanhos exatos

## 🚀 Como Usar

### CenteredSquareBox - Exemplo Básico

```tsx
import CenteredSquareBox from '@/components/ui/CenteredSquareBox';
import { AnimatePresence } from 'framer-motion';

function MyComponent() {
  const [showBox, setShowBox] = useState(false);

  return (
    <>
      <button onClick={() => setShowBox(true)}>
        Abrir Box
      </button>
      
      <AnimatePresence>
        {showBox && (
          <CenteredSquareBox
            size="md"
            onOverlayClick={() => setShowBox(false)}
          >
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Título</h2>
              <p>Conteúdo do box...</p>
            </div>
          </CenteredSquareBox>
        )}
      </AnimatePresence>
    </>
  );
}
```

### FlexibleSquareBox - Exemplo Avançado

```tsx
import FlexibleSquareBox from '@/components/ui/FlexibleSquareBox';

function CustomBox() {
  const [showBox, setShowBox] = useState(false);

  return (
    <AnimatePresence>
      {showBox && (
        <FlexibleSquareBox
          size={25}
          unit="rem"
          glass={true}
          backgroundColor="rgba(255, 255, 255, 0.9)"
          borderColor="#3B82F6"
          borderWidth={2}
          padding={2}
          onOverlayClick={() => setShowBox(false)}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span>Box customizado!</span>
          </div>
        </FlexibleSquareBox>
      )}
    </AnimatePresence>
  );
}
```

## 📋 Propriedades

### CenteredSquareBox Props

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `children` | ReactNode | - | Conteúdo do box |
| `size` | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Tamanho pré-definido |
| `className` | string | '' | Classes CSS adicionais |
| `showOverlay` | boolean | true | Exibir overlay de fundo |
| `onOverlayClick` | function | - | Função chamada ao clicar no overlay |
| `animation` | boolean | true | Ativar animações |
| `glass` | boolean | false | Efeito glass (transparência) |
| `shadow` | 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' | 'xl' | Intensidade da sombra |
| `rounded` | 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' | 'xl' | Bordas arredondadas |

### FlexibleSquareBox Props

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `children` | ReactNode | - | Conteúdo do box |
| `size` | number | 20 | Tamanho numérico |
| `unit` | 'px' \| 'rem' \| 'vw' \| 'vh' | 'rem' | Unidade de medida |
| `className` | string | '' | Classes CSS adicionais |
| `showOverlay` | boolean | true | Exibir overlay de fundo |
| `onOverlayClick` | function | - | Função chamada ao clicar no overlay |
| `animation` | boolean | true | Ativar animações |
| `glass` | boolean | false | Efeito glass |
| `shadow` | boolean | true | Exibir sombra |
| `rounded` | boolean | true | Bordas arredondadas |
| `borderWidth` | number | 1 | Largura da borda em pixels |
| `padding` | number | 1.5 | Padding interno em rem |
| `backgroundColor` | string | - | Cor de fundo customizada |
| `borderColor` | string | - | Cor da borda customizada |

## 📐 Tamanhos Disponíveis (CenteredSquareBox)

| Tamanho | Dimensões | Uso Recomendado |
|---------|-----------|-----------------|
| `sm` | 16rem × 16rem | Alertas pequenos, ícones |
| `md` | 20rem × 20rem | Modais padrão, formulários |
| `lg` | 24rem × 24rem | Conteúdo extenso, imagens |
| `xl` | 28rem × 28rem | Dashboards, gráficos |

## 🎨 Recursos Visuais

### ✅ Características Principais
- **Perfeitamente Quadrado**: Largura = Altura sempre
- **Centralizado**: Posicionamento absoluto no centro da tela
- **Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Animações Suaves**: Transições fluidas de entrada/saída
- **Overlay com Blur**: Fundo escurecido com desfoque
- **Suporte a Temas**: Integração com sistema de temas
- **Efeito Glass**: Transparência com desfoque opcional
- **Acessibilidade**: Suporte a navegação por teclado

### 🎭 Animações Incluídas
- **Entrada**: Fade in + Scale up + Slide up
- **Saída**: Fade out + Scale down + Slide down
- **Overlay**: Fade in/out suave
- **Efeito Spring**: Animação natural tipo mola

## 🔧 Personalização Avançada

### Cores Customizadas
```tsx
<FlexibleSquareBox
  backgroundColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  borderColor="#4F46E5"
  borderWidth={3}
>
  {/* Conteúdo */}
</FlexibleSquareBox>
```

### Tamanhos Responsivos
```tsx
<FlexibleSquareBox
  size={window.innerWidth < 768 ? 18 : 25}
  unit="rem"
>
  {/* Conteúdo */}
</FlexibleSquareBox>
```

### Sem Animações
```tsx
<CenteredSquareBox
  animation={false}
  size="lg"
>
  {/* Conteúdo estático */}
</CenteredSquareBox>
```

## 📱 Responsividade

Os componentes são totalmente responsivos e se adaptam a:
- **Desktop**: Tamanhos completos
- **Tablet**: Ajuste automático com padding
- **Mobile**: Redimensionamento inteligente

## 🌈 Integração com Temas

Os componentes se integram automaticamente com o sistema de temas:
- **Tema Claro**: Fundo branco, bordas sutis
- **Tema Escuro**: Fundo escuro, bordas destacadas
- **Tema Moderno**: Efeitos glass e gradientes

## 🎯 Casos de Uso Comuns

### 1. Modal de Confirmação
```tsx
<CenteredSquareBox size="sm" onOverlayClick={onClose}>
  <div className="text-center">
    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold mb-2">Confirmar Ação</h3>
    <p className="text-gray-600 mb-4">Tem certeza que deseja continuar?</p>
    <div className="flex gap-2">
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  </div>
</CenteredSquareBox>
```

### 2. Loading Spinner
```tsx
<CenteredSquareBox size="sm" showOverlay={false}>
  <div className="flex flex-col items-center">
    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
    <p>Carregando...</p>
  </div>
</CenteredSquareBox>
```

### 3. Showcase de Produto
```tsx
<CenteredSquareBox size="xl" glass={true}>
  <div className="w-full h-full p-6">
    <img src="/produto.jpg" className="w-full h-2/3 object-cover rounded-lg mb-4" />
    <h2 className="text-xl font-bold mb-2">Nome do Produto</h2>
    <p className="text-gray-600">Descrição detalhada...</p>
  </div>
</CenteredSquareBox>
```

## 🎬 Demonstração

Para ver os componentes em ação, acesse:
- **URL**: `/examples/centered-box`
- **Arquivo**: `src/app/(main)/examples/centered-box/page.tsx`

## 🔍 Debugging

### Problemas Comuns

1. **Box não aparece**: Verifique se está usando `AnimatePresence`
2. **Overlay não funciona**: Certifique-se de que `onOverlayClick` está definido
3. **Animações travadas**: Verifique se `framer-motion` está instalado
4. **Temas não aplicados**: Confirme se o `ThemeProvider` está configurado

### Logs de Debug
```tsx
<CenteredSquareBox
  onOverlayClick={() => {
    console.log('Overlay clicado');
    setShowBox(false);
  }}
>
  {/* Conteúdo */}
</CenteredSquareBox>
```

## 🚀 Performance

- **Lazy Loading**: Componentes só são renderizados quando necessário
- **Animações Otimizadas**: Uso de `transform` e `opacity` para melhor performance
- **Memory Cleanup**: Limpeza automática de event listeners

## 📦 Dependências

- `react`
- `framer-motion`
- `@/contexts/ThemeContext`
- `tailwindcss`

## 🤝 Contribuindo

Para adicionar novos recursos:
1. Mantenha a proporção quadrada
2. Preserve a centralização
3. Adicione testes para novos props
4. Documente mudanças neste arquivo 