import { useCallback, useEffect, useRef } from 'react';

interface OptimizedTransitionOptions {
  duration?: number;
  easing?: string;
  delay?: number;
}

export function useOptimizedTransition(options: OptimizedTransitionOptions = {}) {
  const {
    duration = 150,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    delay = 0
  } = options;

  const rafRef = useRef<number>();
  const elementRef = useRef<HTMLElement | null>(null);

  // Cancelar animações pendentes
  const cancelAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }, []);

  // Executar transição otimizada
  const executeTransition = useCallback((
    element: HTMLElement,
    styles: Partial<CSSStyleDeclaration>,
    callback?: () => void
  ) => {
    cancelAnimation();

    // Usar requestAnimationFrame para melhor performance
    rafRef.current = requestAnimationFrame(() => {
      // Forçar GPU acceleration
      element.style.willChange = Object.keys(styles).join(', ');
      element.style.transform = element.style.transform || 'translateZ(0)';
      
      // Aplicar transição
      element.style.transition = `all ${duration}ms ${easing} ${delay}ms`;
      
      // Aplicar estilos
      Object.assign(element.style, styles);

      // Limpar após a transição
      const cleanup = () => {
        element.style.willChange = 'auto';
        if (callback) callback();
      };

      setTimeout(cleanup, duration + delay);
    });
  }, [duration, easing, delay, cancelAnimation]);

  // Toggle de visibilidade otimizado
  const toggleVisibility = useCallback((
    element: HTMLElement,
    visible: boolean,
    callback?: () => void
  ) => {
    if (visible) {
      element.style.display = 'block';
      // Forçar reflow
      element.offsetHeight;
      
      executeTransition(element, {
        opacity: '1',
        transform: 'translateX(0) translateZ(0)'
      }, callback);
    } else {
      executeTransition(element, {
        opacity: '0',
        transform: 'translateX(-100%) translateZ(0)'
      }, () => {
        element.style.display = 'none';
        if (callback) callback();
      });
    }
  }, [executeTransition]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  return {
    elementRef,
    executeTransition,
    toggleVisibility,
    cancelAnimation
  };
}

// Hook para otimizar performance do menu
export function useMenuOptimization() {
  const transition = useOptimizedTransition({ duration: 200 });
  const menuRef = useRef<HTMLElement | null>(null);
  const isOpenRef = useRef(false);

  // Otimizar abertura/fechamento do menu
  const toggleMenu = useCallback((open?: boolean) => {
    const menu = menuRef.current;
    if (!menu) return;

    const shouldOpen = open !== undefined ? open : !isOpenRef.current;
    isOpenRef.current = shouldOpen;

    transition.toggleVisibility(menu, shouldOpen);
  }, [transition]);

  // Preparar menu para animações
  const prepareMenu = useCallback((element: HTMLElement) => {
    menuRef.current = element;
    
    // Otimizações CSS
    element.style.contain = 'layout style paint';
    element.style.willChange = 'transform, opacity';
    
    // Adicionar classes para hardware acceleration
    element.classList.add('gpu-accelerated');
  }, []);

  return {
    menuRef,
    toggleMenu,
    prepareMenu,
    isOpen: isOpenRef.current
  };
}

// Hook para debounce otimizado
export function useOptimizedDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Atualizar callback ref quando mudar
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;

  return debouncedCallback;
}

// Hook para throttle otimizado
export function useOptimizedThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Atualizar callback ref quando mudar
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;

    if (timeSinceLastRun >= delay) {
      lastRunRef.current = now;
      callbackRef.current(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now();
        callbackRef.current(...args);
      }, delay - timeSinceLastRun);
    }
  }, [delay]) as T;

  return throttledCallback;
}

// Hook para detectar performance do dispositivo
export function useDevicePerformance() {
  const performanceRef = useRef<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    // Detectar número de cores do CPU
    const cores = navigator.hardwareConcurrency || 4;
    
    // Detectar memória disponível (se suportado)
    const memory = (navigator as any).deviceMemory || 4;
    
    // Detectar connection speed
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';
    
    // Calcular performance score
    let score = 0;
    
    // CPU cores
    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else score += 1;
    
    // Memory
    if (memory >= 8) score += 3;
    else if (memory >= 4) score += 2;
    else score += 1;
    
    // Connection
    if (effectiveType === '4g') score += 2;
    else if (effectiveType === '3g') score += 1;
    
    // Determinar nível de performance
    if (score >= 7) performanceRef.current = 'high';
    else if (score >= 4) performanceRef.current = 'medium';
    else performanceRef.current = 'low';
    
    console.log(`Device performance detected: ${performanceRef.current} (score: ${score})`);
  }, []);

  return performanceRef.current;
}

// Hook para prefetch de recursos
export function usePrefetch() {
  const prefetchedRef = useRef<Set<string>>(new Set());

  const prefetchResource = useCallback((url: string, type: 'image' | 'script' | 'style' | 'document' = 'document') => {
    if (prefetchedRef.current.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = type;
    link.href = url;
    
    // Adicionar crossorigin para scripts e estilos
    if (type === 'script' || type === 'style') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
    prefetchedRef.current.add(url);
    
    // Remover após 5 minutos para evitar acúmulo
    setTimeout(() => {
      link.remove();
      prefetchedRef.current.delete(url);
    }, 5 * 60 * 1000);
  }, []);

  const preloadResource = useCallback((url: string, type: 'image' | 'script' | 'style' | 'font' = 'script') => {
    if (prefetchedRef.current.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type;
    link.href = url;
    
    // Configurações específicas por tipo
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
      link.type = 'font/woff2';
    } else if (type === 'script' || type === 'style') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
    prefetchedRef.current.add(url);
  }, []);

  return { prefetchResource, preloadResource };
}
