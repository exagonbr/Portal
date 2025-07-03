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
    
