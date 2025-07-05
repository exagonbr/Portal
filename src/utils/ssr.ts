'use client';

import React, { useState, useEffect, ComponentType, ReactNode, useRef, useCallback } from 'react';

/**
 * Hook to detect if we're running on the client side
 * Prevents hydration mismatches by returning false during SSR
 * FIXED: More stable implementation to prevent loops
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setIsClient(true);
    }
  }, []);

  return isClient;
}

/**
 * Hook to safely access localStorage with SSR support
 * Returns null during SSR and actual value on client
 * FIXED: Improved stability to prevent infinite re-renders
 */
export function useLocalStorage(key: string, defaultValue: string = ''): {
  value: string | null;
  setValue: (value: string) => void;
  removeValue: () => void;
} {
  const [isClient, setIsClient] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const keyRef = useRef(key);

  // Update key ref if it changes
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  // Initialize client detection only once
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setIsClient(true);
    }
  }, []);

  // Initialize value from localStorage only once when client is ready
  useEffect(() => {
    if (isClient && value === null) {
      try {
        const stored = localStorage.getItem(keyRef.current);
        setValue(stored || defaultValue);
      } catch (error) {
        console.warn(`Error reading localStorage key "${keyRef.current}":`, error);
        setValue(defaultValue);
      }
    }
  }, [isClient, defaultValue]); // Removed 'key' from dependencies to prevent loops

  const setStoredValue = useCallback((newValue: string) => {
    if (isClient) {
      try {
        localStorage.setItem(keyRef.current, newValue);
        setValue(newValue);
      } catch (error) {
        console.warn(`Error setting localStorage key "${keyRef.current}":`, error);
      }
    }
  }, [isClient]);

  const removeStoredValue = useCallback(() => {
    if (isClient) {
      try {
        localStorage.removeItem(keyRef.current);
        setValue(null);
      } catch (error) {
        console.warn(`Error removing localStorage key "${keyRef.current}":`, error);
      }
    }
  }, [isClient]);

  return {
    value: isClient ? value : null,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
  };
}

/**
 * Hook to safely access sessionStorage with SSR support
 * FIXED: Improved stability similar to localStorage
 */
export function useSessionStorage(key: string, defaultValue: string = ''): {
  value: string | null;
  setValue: (value: string) => void;
  removeValue: () => void;
} {
  const [isClient, setIsClient] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const keyRef = useRef(key);

  // Update key ref if it changes
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  // Initialize client detection only once
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setIsClient(true);
    }
  }, []);

  // Initialize value from sessionStorage only once when client is ready
  useEffect(() => {
    if (isClient && value === null) {
      try {
        const stored = sessionStorage.getItem(keyRef.current);
        setValue(stored || defaultValue);
      } catch (error) {
        console.warn(`Error reading sessionStorage key "${keyRef.current}":`, error);
        setValue(defaultValue);
      }
    }
  }, [isClient, defaultValue]); // Removed 'key' from dependencies to prevent loops

  const setStoredValue = useCallback((newValue: string) => {
    if (isClient) {
      try {
        sessionStorage.setItem(keyRef.current, newValue);
        setValue(newValue);
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${keyRef.current}":`, error);
      }
    }
  }, [isClient]);

  const removeStoredValue = useCallback(() => {
    if (isClient) {
      try {
        sessionStorage.removeItem(keyRef.current);
        setValue(null);
      } catch (error) {
        console.warn(`Error removing sessionStorage key "${keyRef.current}":`, error);
      }
    }
  }, [isClient]);

  return {
    value: isClient ? value : null,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
  };
}

/**
 * Hook to safely access window object with SSR support
 */
export function useWindow(): Window | null {
  const isClient = useIsClient();
  return isClient ? window : null;
}

/**
 * Hook to safely access document object with SSR support
 */
export function useDocument(): Document | null {
  const isClient = useIsClient();
  return isClient ? document : null;
}

/**
 * Hook for safe media query matching with SSR support
 */
export function useMediaQuery(query: string): boolean {
  const isClient = useIsClient();
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query, isClient]);

  return isClient ? matches : false;
}

/**
 * Utility function to check if code is running on server
 */
export const isServer = typeof window === 'undefined';

/**
 * Utility function to check if code is running on client
 */
export const isClient = typeof window !== 'undefined';

/**
 * Safe wrapper for browser APIs that might not exist during SSR
 */
export const safeWindow = {
  get location() {
    return isClient ? window.location : null;
  },
  get navigator() {
    return isClient ? window.navigator : null;
  },
  get localStorage() {
    return isClient ? window.localStorage : null;
  },
  get sessionStorage() {
    return isClient ? window.sessionStorage : null;
  },
  get matchMedia() {
    return isClient ? window.matchMedia.bind(window) : null;
  },
  addEventListener: (event: string, handler: EventListener) => {
    if (isClient) {
      window.addEventListener(event, handler);
    }
  },
  removeEventListener: (event: string, handler: EventListener) => {
    if (isClient) {
      window.removeEventListener(event, handler);
    }
  },
};

/**
 * Safe wrapper for document APIs that might not exist during SSR
 */
export const safeDocument = {
  get body() {
    return isClient ? document.body : null;
  },
  get documentElement() {
    return isClient ? document.documentElement : null;
  },
  get cookie() {
    return isClient ? document.cookie : '';
  },
  set cookie(value: string) {
    if (isClient) {
      document.cookie = value;
    }
  },
  addEventListener: (event: string, handler: EventListener) => {
    if (isClient) {
      document.addEventListener(event, handler);
    }
  },
  removeEventListener: (event: string, handler: EventListener) => {
    if (isClient) {
      document.removeEventListener(event, handler);
    }
  },
  createElement: (tagName: string) => {
    return isClient ? document.createElement(tagName) : null;
  },
  querySelector: (selector: string) => {
    return isClient ? document.querySelector(selector) : null;
  },
  querySelectorAll: (selector: string) => {
    return isClient ? document.querySelectorAll(selector) : [];
  },
};

/**
 * Higher-order component to prevent hydration mismatches
 */
export function withNoSSR<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode
): ComponentType<P> {
  const NoSSRComponent = (props: P) => {
    const isClient = useIsClient();

    if (!isClient) {
      return React.createElement(React.Fragment, null, fallback);
    }

    return React.createElement(WrappedComponent, props);
  };

  NoSSRComponent.displayName = `withNoSSR(${WrappedComponent.displayName || WrappedComponent.name})`;
  return NoSSRComponent;
}

// Re-export ClientOnly component for convenience
export { default as ClientOnly } from '@/components/ClientOnly';
