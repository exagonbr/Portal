// Utilitários de leitura inspirados no koodo-reader
export class ReaderUtils {
  static getPageDimensions(
    readerMode: 'single' | 'double' | 'scroll',
    scale: number = 1,
    margin: number = 0,
    isNavLocked: boolean = false,
    isSettingLocked: boolean = false
  ) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let availableWidth = windowWidth - (isNavLocked ? 300 : 0) - (isSettingLocked ? 300 : 0);
    let availableHeight = windowHeight - 80; // Para header/footer
    
    // Aplicar margens
    availableWidth -= margin * 2;
    availableHeight -= margin * 2;
    
    if (readerMode === 'double') {
      availableWidth = Math.floor(availableWidth / 2) - 20;
    }
    
    return {
      width: Math.max(300, availableWidth * scale),
      height: Math.max(400, availableHeight * scale),
      offset: margin,
    };
  }

  static getOptimalScale(containerWidth: number, containerHeight: number, contentWidth: number, contentHeight: number) {
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    return Math.min(scaleX, scaleY, 2.0); // Máximo 200%
  }

  static debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  }

  static throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }

  static isValidCFI(cfi: string): boolean {
    return typeof cfi === 'string' && cfi.startsWith('epubcfi(') && cfi.endsWith(')');
  }

  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  static getReadingProgress(currentPage: number, totalPages: number): number {
    if (!totalPages || totalPages === 0) return 0;
    return Math.min(100, Math.max(0, (currentPage / totalPages) * 100));
  }

  static formatReadingTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }

  static calculateEstimatedReadingTime(wordCount: number, wpm: number = 200): number {
    return Math.ceil(wordCount / wpm);
  }
} 