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

    // Desabilitar pointer events durante animação
    menu.style.pointerEvents = 'none';

    transition.toggleVisibility(menu, shouldOpen, () => {
      menu.style.pointerEvents = 'auto';
    });
  }, [transition]);

  // Otimizar hover effects
  const optimizeHover = useCallback((element: HTMLElement) => {
    let hoverTimeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
      clearTimeout(hoverTimeout);
      element.style.willChange = 'background-color, transform';
      element.style.transform = 'translateZ(0)';
    };

    const handleMouseLeave = () => {
      hoverTimeout = setTimeout(() => {
        element.style.willChange = 'auto';
      }, 300);
    };

    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(hoverTimeout);
    };
  }, []);

  // Otimizar scroll do menu
  const optimizeScroll = useCallback((element: HTMLElement) => {
    let scrollTimeout: NodeJS.Timeout;
    let isScrolling = false;

    const handleScrollStart = () => {
      if (!isScrolling) {
        isScrolling = true;
        element.style.willChange = 'scroll-position';
        element.style.pointerEvents = 'none';
      }
    };

    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        element.style.willChange = 'auto';
        element.style.pointerEvents = 'auto';
      }, 150);
    };

    const handleScroll = () => {
      handleScrollStart();
      handleScrollEnd();
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Setup inicial
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    // Aplicar otimizações CSS
    menu.style.contain = 'layout style paint';
    menu.style.backfaceVisibility = 'hidden';
    menu.style.perspective = '1000px';
    menu.style.webkitOverflowScrolling = 'touch';

    // Otimizar todos os botões e links do menu
    const interactiveElements = menu.querySelectorAll('button, a');
    const cleanupFunctions: (() => void)[] = [];

    interactiveElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        cleanupFunctions.push(optimizeHover(element));
      }
    });

    // Otimizar scroll se houver
    const scrollableElements = menu.querySelectorAll('[data-scrollable], nav');
    scrollableElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        cleanupFunctions.push(optimizeScroll(element));
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [optimizeHover, optimizeScroll]);

  return {
    menuRef,
    toggleMenu,
    isOpen: isOpenRef.current
  };
}
