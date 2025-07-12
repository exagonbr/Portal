// Configurações modernas para o KoodoReader 2.0.0

export interface ModernKoodoConfig {
  theme: 'light' | 'dark' | 'sepia';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margin: number;
  background: string;
  textColor: string;
  aiEnabled: boolean;
  syncEnabled: boolean;
  gesturesEnabled: boolean;
  progressTracking: boolean;
  readingGoals: boolean;
  focusMode: boolean;
}

// Presets de configuração baseados no KoodoReader 2.0.0
export const modernConfigPresets = {
  // Configuração padrão moderna
  default: {
    theme: 'light' as const,
    fontSize: 16,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.6,
    margin: 20,
    background: '#ffffff',
    textColor: '#1a1a1a',
    aiEnabled: true,
    syncEnabled: true,
    gesturesEnabled: true,
    progressTracking: true,
    readingGoals: true,
    focusMode: false
  } as ModernKoodoConfig,

  // Tema escuro otimizado
  dark: {
    theme: 'dark' as const,
    fontSize: 16,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.6,
    margin: 20,
    background: '#1a1a1a',
    textColor: '#e0e0e0',
    aiEnabled: true,
    syncEnabled: true,
    gesturesEnabled: true,
    progressTracking: true,
    readingGoals: true,
    focusMode: false
  } as ModernKoodoConfig,

  // Tema sépia para leitura confortável
  sepia: {
    theme: 'sepia' as const,
    fontSize: 17,
    fontFamily: 'Georgia, "Times New Roman", serif',
    lineHeight: 1.7,
    margin: 25,
    background: '#f7f4e7',
    textColor: '#5c4b37',
    aiEnabled: true,
    syncEnabled: true,
    gesturesEnabled: true,
    progressTracking: true,
    readingGoals: true,
    focusMode: false
  } as ModernKoodoConfig,

  // Configuração para leitura focada
  focus: {
    theme: 'light' as const,
    fontSize: 18,
    fontFamily: 'Georgia, "Times New Roman", serif',
    lineHeight: 1.8,
    margin: 30,
    background: '#ffffff',
    textColor: '#2d2d2d',
    aiEnabled: false, // IA desabilitada para foco
    syncEnabled: true,
    gesturesEnabled: true,
    progressTracking: true,
    readingGoals: true,
    focusMode: true
  } as ModernKoodoConfig,

  // Configuração para dispositivos móveis
  mobile: {
    theme: 'light' as const,
    fontSize: 15,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1.5,
    margin: 15,
    background: '#ffffff',
    textColor: '#1a1a1a',
    aiEnabled: true,
    syncEnabled: true,
    gesturesEnabled: true,
    progressTracking: true,
    readingGoals: true,
    focusMode: false
  } as ModernKoodoConfig,

  // Configuração para acessibilidade
  accessibility: {
    theme: 'light' as const,
    fontSize: 20, // Fonte maior
    fontFamily: 'Arial, sans-serif', // Fonte de alta legibilidade
    lineHeight: 2.0, // Espaçamento maior
    margin: 35,
    background: '#ffffff',
    textColor: '#000000', // Contraste máximo
    aiEnabled: true,
    syncEnabled: true,
    gesturesEnabled: false, // Gestos desabilitados
    progressTracking: true,
    readingGoals: false,
    focusMode: true
  } as ModernKoodoConfig,

  // Configuração minimalista
  minimal: {
    theme: 'light' as const,
    fontSize: 16,
    fontFamily: 'system-ui, sans-serif',
    lineHeight: 1.6,
    margin: 40,
    background: '#fdfdfd',
    textColor: '#333333',
    aiEnabled: false,
    syncEnabled: false,
    gesturesEnabled: false,
    progressTracking: false,
    readingGoals: false,
    focusMode: true
  } as ModernKoodoConfig
};

// Utilitários para configuração
export const configUtils = {
  // Criar configuração personalizada baseada em um preset
  createCustomConfig: (
    preset: keyof typeof modernConfigPresets, 
    overrides: Partial<ModernKoodoConfig>
  ): ModernKoodoConfig => {
    return {
      ...modernConfigPresets[preset],
      ...overrides
    };
  },

  // Validar configuração
  validateConfig: (config: Partial<ModernKoodoConfig>): boolean => {
    const errors: string[] = [];

    if (config.fontSize && (config.fontSize < 10 || config.fontSize > 30)) {
      errors.push('Tamanho da fonte deve estar entre 10 e 30px');
    }

    if (config.lineHeight && (config.lineHeight < 1.0 || config.lineHeight > 3.0)) {
      errors.push('Altura da linha deve estar entre 1.0 e 3.0');
    }

    if (config.margin && (config.margin < 0 || config.margin > 100)) {
      errors.push('Margem deve estar entre 0 e 100px');
    }

    if (errors.length > 0) {
      console.warn('Erros de validação na configuração:', errors);
      return false;
    }

    return true;
  },

  // Obter configuração baseada no dispositivo
  getDeviceOptimizedConfig: (): ModernKoodoConfig => {
    if (typeof window === 'undefined') {
      return modernConfigPresets.default;
    }

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: default)').matches;

    let baseConfig = isMobile ? modernConfigPresets.mobile : modernConfigPresets.default;

    if (prefersDarkMode) {
      baseConfig = modernConfigPresets.default;
    }

    // Ajustes para acessibilidade
    if (prefersReducedMotion) {
      baseConfig = {
        ...baseConfig,
        gesturesEnabled: false,
        focusMode: true
      };
    }

    return baseConfig;
  },

  // Salvar configuração no localStorage
  saveConfig: (config: ModernKoodoConfig, userId?: string): void => {
    const key = userId ? `modern-koodo-config-${userId}` : 'modern-koodo-config';
    
    try {
      localStorage.setItem(key, JSON.stringify(config));
      console.log('✅ Configuração salva:', key);
    } catch (error) {
      console.log('❌ Erro ao salvar configuração:', error);
    }
  },

  // Carregar configuração do localStorage
  loadConfig: (userId?: string): ModernKoodoConfig | null => {
    const key = userId ? `modern-koodo-config-${userId}` : 'modern-koodo-config';
    
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const config = JSON.parse(saved) as ModernKoodoConfig;
        
        if (configUtils.validateConfig(config)) {
          console.log('✅ Configuração carregada:', key);
          return config;
        }
      }
    } catch (error) {
      console.log('❌ Erro ao carregar configuração:', error);
    }

    return null;
  },

  // Migrar configuração legada
  migrateFromLegacyConfig: (legacyConfig: any): ModernKoodoConfig => {
    const defaultConfig = modernConfigPresets.default;

    return {
      ...defaultConfig,
      theme: legacyConfig.isDarkMode ? 'dark' : 'light',
      fontSize: legacyConfig.scale ? defaultConfig.fontSize * legacyConfig.scale : defaultConfig.fontSize,
      fontFamily: legacyConfig.fontFamily || defaultConfig.fontFamily,
      // Mapear outras configurações conforme necessário
    };
  }
};

// Configurações específicas para diferentes tipos de leitura
export const readingModeConfigs = {
  // Leitura de ficção
  fiction: configUtils.createCustomConfig('sepia', {
    fontSize: 17,
    lineHeight: 1.7,
    fontFamily: 'Georgia, "Times New Roman", serif',
    margin: 25
  }),

  // Leitura técnica/estudo
  technical: configUtils.createCustomConfig('default', {
    fontSize: 15,
    lineHeight: 1.5,
    fontFamily: 'Inter, sans-serif',
    margin: 20,
    aiEnabled: true, // IA útil para textos técnicos
    progressTracking: true
  }),

  // Leitura noturna
  night: configUtils.createCustomConfig('dark', {
    fontSize: 16,
    lineHeight: 1.7,
    background: '#0f0f0f',
    textColor: '#d0d0d0',
    gesturesEnabled: true
  }),

  // Leitura em movimento
  mobile_reading: configUtils.createCustomConfig('mobile', {
    fontSize: 16,
    margin: 12,
    gesturesEnabled: true,
    syncEnabled: true
  })
};

// Constantes para facilitar o uso
export const MODERN_KOODO_CONSTANTS = {
  MIN_FONT_SIZE: 10,
  MAX_FONT_SIZE: 30,
  MIN_LINE_HEIGHT: 1.0,
  MAX_LINE_HEIGHT: 3.0,
  MIN_MARGIN: 0,
  MAX_MARGIN: 100,
  CACHE_MAX_SIZE: 5,
  SYNC_INTERVAL: 30000, // 30 segundos
  AI_TIMEOUT: 10000, // 10 segundos
};

export default {
  presets: modernConfigPresets,
  utils: configUtils,
  readingModes: readingModeConfigs,
  constants: MODERN_KOODO_CONSTANTS
}; 