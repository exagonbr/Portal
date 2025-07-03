// Serviço de configuração inspirado no koodo-reader
export interface ReaderConfig {
  scale: number;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margin: number;
  theme: 'light' | 'dark' | 'sepia';
  backgroundColor: string;
  textColor: string;
  readerMode: 'single' | 'double' | 'scroll';
  isAutoScroll: boolean;
  scrollSpeed: number;
  isPreventTrigger: boolean;
  isTouch: boolean;
  isSliding: boolean;
  columnCount: number;
  pageAnimationType: 'slide' | 'fade' | 'none';
}

export interface BookLocation {
  bookKey: string;
  page: number;
  cfi?: string;
  chapterIndex: number;
  chapterTitle: string;
  percentage: number;
  timestamp: number;
  readingTime: number;
}

export class ConfigService {
  private static CONFIG_KEY = 'portal-reader-config';
  private static LOCATIONS_KEY = 'portal-reader-locations';
  
  private static defaultConfig: ReaderConfig = {
    scale: 1.0,
    fontSize: 16,
    fontFamily: 'Georgia, serif',
    lineHeight: 1.6,
    margin: 40,
    theme: 'light',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    readerMode: 'single',
    isAutoScroll: false,
    scrollSpeed: 50,
    isPreventTrigger: false,
    isTouch: false,
    isSliding: false,
    columnCount: 1,
    pageAnimationType: 'slide',
  };

  static getConfig(): ReaderConfig {
    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      if (stored) {
        return { ...this.defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Erro ao carregar configurações:', error);
    }
    return { ...this.defaultConfig };
  }

  static setConfig(config: Partial<ReaderConfig>): void {
    try {
      const currentConfig = this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  static getConfigValue<K extends keyof ReaderConfig>(key: K): ReaderConfig[K] {
    const config = this.getConfig();
    return config[key];
  }

  static setConfigValue<K extends keyof ReaderConfig>(key: K, value: ReaderConfig[K]): void {
    this.setConfig({ [key]: value });
  }

  static saveBookLocation(bookKey: string, location: Omit<BookLocation, 'bookKey' | 'timestamp'>): void {
    try {
      const locations = this.getBookLocations();
      const bookLocation: BookLocation = {
        ...location,
        bookKey,
        timestamp: Date.now(),
      };
      
      locations[bookKey] = bookLocation;
      localStorage.setItem(this.LOCATIONS_KEY, JSON.stringify(locations));
    } catch (error) {
      console.error('Erro ao salvar localização do livro:', error);
    }
  }

  static getBookLocation(bookKey: string): BookLocation | null {
    try {
      const locations = this.getBookLocations();
      return locations[bookKey] || null;
    } catch (error) {
      console.error('Erro ao carregar localização do livro:', error);
      return null;
    }
  }

  static getBookLocations(): Record<string, BookLocation> {
    try {
      const stored = localStorage.getItem(this.LOCATIONS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Erro ao carregar localizações:', error);
      return {};
    }
  }

  static updateReadingTime(bookKey: string, additionalSeconds: number): void {
    const location = this.getBookLocation(bookKey);
    if (location) {
      this.saveBookLocation(bookKey, {
        ...location,
        readingTime: location.readingTime + additionalSeconds,
      });
    }
  }

  static getThemeStyles(theme: ReaderConfig['theme']) {
    switch (theme) {
      case 'dark':
        return {
          backgroundColor: '#1a1a1a',
          textColor: '#e5e5e5',
          linkColor: '#60a5fa',
        };
      case 'sepia':
        return {
          backgroundColor: '#f4f1ea',
          textColor: '#5c4b37',
          linkColor: '#8b4513',
        };
      default: // light
        return {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          linkColor: '#3b82f6',
        };
    }
  }

  static exportSettings(): string {
    return JSON.stringify({
      config: this.getConfig(),
      locations: this.getBookLocations(),
    }, null, 2);
  }

  static importSettings(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.config) {
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(parsed.config));
      }
      if (parsed.locations) {
        localStorage.setItem(this.LOCATIONS_KEY, JSON.stringify(parsed.locations));
      }
      return true;
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      return false;
    }
  }

  static resetToDefaults(): void {
    localStorage.removeItem(this.CONFIG_KEY);
  }
} 