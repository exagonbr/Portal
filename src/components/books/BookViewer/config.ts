// Configurações do visualizador de livros

export const VIEWER_CONFIG = {
  pdf: {
    defaultScale: 1.0,
    minScale: 0.5,
    maxScale: 3.0,
    scaleStep: 0.1,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
    workerSrc: `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`
  },
  epub: {
    defaultFontSize: '100%',
    fontSizeStep: 20,
    minFontSize: 60,
    maxFontSize: 200,
    themes: {
      light: {
        background: '#ffffff',
        color: '#000000',
        linkColor: '#0066cc'
      },
      dark: {
        background: '#1a1a1a',
        color: '#e0e0e0',
        linkColor: '#66b3ff'
      },
      sepia: {
        background: '#f4ecd8',
        color: '#5c4b37',
        linkColor: '#8b6914'
      }
    }
  },
  ui: {
    panelWidth: 320,
    headerHeight: 64,
    footerHeight: 64,
    animationDuration: 300,
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#f9f9fa',
      darkBackground: '#1a1a1a'
    }
  },
  storage: {
    prefix: 'unified-book-viewer',
    keys: {
      theme: 'theme',
      scale: 'scale',
      fontSize: 'fontSize',
      bookmarks: 'bookmarks',
      highlights: 'highlights',
      annotations: 'annotations',
      readingProgress: 'reading-progress'
    }
  }
}

// Funções auxiliares para armazenamento local
export const storage = {
  get: (key: string) => {
    try {
      const value = localStorage.getItem(`${VIEWER_CONFIG.storage.prefix}-${key}`)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(`${VIEWER_CONFIG.storage.prefix}-${key}`, JSON.stringify(value))
    } catch (error) {
      console.log('Erro ao salvar no localStorage:', error)
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(`${VIEWER_CONFIG.storage.prefix}-${key}`)
    } catch (error) {
      console.log('Erro ao remover do localStorage:', error)
    }
  }
}

// Tipos para o visualizador
export interface ViewerTheme {
  background: string
  color: string
  linkColor?: string
}

export interface ReadingProgress {
  bookId: string
  currentPage?: number
  currentCfi?: string
  percentage: number
  lastRead: Date
}

export interface ViewerSettings {
  theme: 'light' | 'dark' | 'sepia'
  scale: number
  fontSize: number
  sidebarOpen: boolean
  fullscreen: boolean
} 