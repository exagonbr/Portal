import { useCallback, useEffect, useRef } from 'react';

interface OptimizedTransitionOptions {
  duration?: number;
  easing?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export function useOptimizedTransition() {
  const rafRef = useRef<number | null>(null);
  const transitionRef = useRef<boolean>(false);

  // Limpar animações pendentes ao desmontar
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const startTransition = useCallback((
    element: HTMLElement | null,
    properties: Record<string, string>,
    options: OptimizedTransitionOptions = {}
  ) => {
    if (!element || transitionRef.current) return;

    const {
      duration = 150,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
      onStart,
      onComplete
    } = options;

    // Cancelar animação anterior
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    transitionRef.current = true;

    // Preparar elemento para animação otimizada
    element.style.willChange = Object.keys(properties).join(', ');
    element.style.transition = `all ${duration}ms ${easing}`;

    // Forçar reflow antes da animação
    element.offsetHeight;

    // Callback de início
    onStart?.();

    // Aplicar propriedades no próximo frame
    rafRef.current = requestAnimationFrame(() => {
      Object.entries(properties).forEach(([prop, value]) => {
        (element.style as any)[prop] = value;
      });

      // Limpar após a transição
      setTimeout(() => {
        element.style.willChange = 'auto';
        transitionRef.current = false;
        onComplete?.();
      }, duration);
    });
  }, []);

  const cancelTransition = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    element.style.transition = 'none';
    element.style.willChange = 'auto';
    transitionRef.current = false;
  }, []);

  return { startTransition, cancelTransition };
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
