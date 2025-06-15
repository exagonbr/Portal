'use client';

import { useEffect, useState } from 'react';
import { emergencyLoopReset, getLoopPrevention } from '@/utils/loop-prevention';

export function LoopEmergencyReset() {
  const [showReset, setShowReset] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Verificar a cada 2 segundos se há loops
    const interval = setInterval(() => {
      const loopPrevention = getLoopPrevention();
      if (loopPrevention) {
        const currentStats = loopPrevention.getStats();
        setStats(currentStats);
        
        // Mostrar botão de reset se houver URLs bloqueadas
        if (currentStats.blockedUrls > 0) {
          setShowReset(true);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!showReset) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">Loop de Requisições Detectado</h3>
          <p className="mt-1 text-sm opacity-90">
            Sistema detectou {stats?.blockedUrls || 0} URL(s) bloqueada(s) por loop.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => {
                emergencyLoopReset();
                setShowReset(false);
              }}
              className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Resetar Sistema
            </button>
            <button
              onClick={() => setShowReset(false)}
              className="bg-red-700 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-800 transition-colors"
            >
              Ignorar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 