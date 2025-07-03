# Player de Vídeo Customizável

Este projeto inclui um player de vídeo totalmente customizável e repleto de funcionalidades para oferecer uma experiência rica de aprendizado.

## Recursos Principais

### 🎮 Controles Avançados
- Player HTML5 nativo com controles customizados
- Suporte a múltiplas fontes de vídeo (MP4, WebM, OGG, YouTube, Vimeo)
- Controle de velocidade de reprodução (0.5x a 2x)
- Controle de volume com slider
- Barra de progresso interativa
- Tela cheia com suporte a ESC

### 📝 Sistema de Anotações
- Adicione anotações em qualquer momento do vídeo
- Visualize todas as anotações em um painel lateral
- Clique em uma anotação para pular para o timestamp
- Edite ou delete anotações facilmente
- Persistência automática no localStorage

### 🔖 Marcadores
- Marque momentos importantes do vídeo
- Visualização dos marcadores na barra de progresso
- Lista de marcadores no painel lateral
- Navegação rápida entre marcadores

### ⚙️ Configurações
- Qualidade de vídeo ajustável
- Velocidade de reprodução customizável
- Suporte a legendas (WebVTT)
- Configurações salvas automaticamente

### ⭐ Funcionalidades Interativas
- Sistema de avaliação (1-5 estrelas)
- Compartilhamento de vídeos
- Exportação/importação de dados do usuário
- Progresso automático salvo

### ⌨️ Atalhos de Teclado
- `Espaço`: Play/Pause
- `←/→`: Retroceder/Avançar 10 segundos
- `↑/↓`: Aumentar/Diminuir volume
- `F`: Tela cheia
- `M`: Mute/Unmute
- `N`: Nova anotação
- `B`: Adicionar marcador
- `ESC`: Fechar player

## Como Usar

### Implementação Básica

```tsx
import CustomVideoPlayer from '@/components/CustomVideoPlayer';

function VideoPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoSources = [
    {
      src: '/videos/meu-video.mp4',
      type: 'video/mp4',
      quality: '1080p',
      label: 'Full HD'
    },
    {
      src: '/videos/meu-video-720.mp4',
      type: 'video/mp4',
      quality: '720p',
      label: 'HD'
    }
  ];

  const subtitles = [
    {
      language: 'pt-BR',
      label: 'Português',
      src: '/subtitles/video-pt.vtt',
      default: true
    },
    {
      language: 'en',
      label: 'English',
      src: '/subtitles/video-en.vtt'
    }
  ];

  return (
    <>
      <button onClick={() => setIsPlaying(true)}>
        Assistir Vídeo
      </button>
      
      {isPlaying && (
        <CustomVideoPlayer
          videoId="video-123"
          title="Meu Vídeo Educacional"
          sources={videoSources}
          subtitles={subtitles}
          autoplay={true}
          thumbnail="/thumbnails/video-thumb.jpg"
          duration={1800} // 30 minutos em segundos
          currentProgress={25} // Começar em 25% do vídeo
          onProgress={(progress) => {
            console.log('Progresso:', progress);
            // Salvar progresso no banco de dados
          }}
          onComplete={() => {
            console.log('Vídeo concluído!');
            setIsPlaying(false);
          }}
          onClose={() => setIsPlaying(false)}
          allowNotes={true}
          allowBookmarks={true}
          allowRating={true}
          allowSharing={true}
          customControls={true}
        />
      )}
    </>
  );
}
```

### Usando o Hook useVideoPlayer

```tsx
import { useVideoPlayer } from '@/hooks/useVideoPlayer';

function VideoComponent({ videoId }: { videoId: string }) {
  const {
    progress,
    notes,
    bookmarks,
    rating,
    settings,
    updateProgress,
    addNote,
    toggleBookmark,
    updateRating,
    exportVideoData,
    importVideoData
  } = useVideoPlayer({ videoId });

  return (
    <div>
      <p>Progresso: {progress}%</p>
      <p>Anotações: {notes.length}</p>
      <p>Marcadores: {bookmarks.length}</p>
      <p>Avaliação: {rating}/5</p>
      
      {/* Exportar dados */}
      <button onClick={() => {
        const data = exportVideoData();
        console.log('Dados do vídeo:', data);
      }}>
        Exportar Dados
      </button>
    </div>
  );
}
```

## Personalização

### Desabilitar Funcionalidades

```tsx
<CustomVideoPlayer
  // ... outras props
  allowNotes={false}        // Desabilitar anotações
  allowBookmarks={false}    // Desabilitar marcadores
  allowRating={false}       // Desabilitar avaliação
  allowSharing={false}      // Desabilitar compartilhamento
  customControls={false}    // Usar controles nativos do browser
/>
```

### Múltiplas Qualidades

```tsx
const videoSources = [
  {
    src: 'https://example.com/video-4k.mp4',
    type: 'video/mp4',
    quality: '4K',
    label: '4K Ultra HD'
  },
  {
    src: 'https://example.com/video-1080p.mp4',
    type: 'video/mp4',
    quality: '1080p',
    label: 'Full HD'
  },
  {
    src: 'https://example.com/video-720p.mp4',
    type: 'video/mp4',
    quality: '720p',
    label: 'HD'
  },
  {
    src: 'https://example.com/video-480p.mp4',
    type: 'video/mp4',
    quality: '480p',
    label: 'SD'
  }
];
```

### Integração com YouTube/Vimeo

```tsx
const videoSources = [
  {
    src: 'https://www.youtube.com/embed/VIDEO_ID',
    type: 'youtube',
    quality: '720p',
    label: 'YouTube HD'
  }
];
```

## Estrutura de Dados

### VideoSource Interface
```tsx
interface VideoSource {
  src: string;
  type: 'video/mp4' | 'video/webm' | 'video/ogg' | 'youtube' | 'vimeo';
  quality?: '360p' | '480p' | '720p' | '1080p' | '4K';
  label?: string;
}
```

### Subtitle Interface
```tsx
interface Subtitle {
  language: string;
  label: string;
  src: string;
  default?: boolean;
}
```

### VideoNote Interface
```tsx
interface VideoNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: Date;
}
```

## Persistência de Dados

O player salva automaticamente:
- Progresso do vídeo
- Anotações do usuário
- Marcadores
- Avaliação
- Configurações de reprodução

Os dados são salvos no `localStorage` com a chave `videoPlayerState_${videoId}`.

## Responsividade

O player é totalmente responsivo e se adapta a:
- Desktop (controles completos)
- Tablet (controles otimizados)
- Mobile (interface touch-friendly)

## Acessibilidade

- Navegação por teclado completa
- Labels ARIA apropriados
- Suporte a screen readers
- Alto contraste nos controles
- Foco visível nos elementos interativos

## Performance

- Lazy loading de vídeos
- Buffering inteligente
- Otimização para dispositivos móveis
- Carregamento progressivo de qualidades
- Cache de configurações do usuário

## Extensibilidade

O player foi projetado para ser facilmente extensível:
- Sistema de plugins
- Hooks customizáveis
- Componentes modulares
- API de eventos rica
- Temas customizáveis 