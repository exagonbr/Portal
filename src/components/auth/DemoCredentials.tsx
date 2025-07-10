'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

interface DemoCredentialsProps {
  onCredentialSelect: (email: string, password: string) => void;
}

export function DemoCredentials({ onCredentialSelect }: DemoCredentialsProps) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const credentials = [
    { role: 'Admin', email: 'admin@sabercon.edu.br', password: 'password' },
    { role: 'Gestor', email: 'gestor@sabercon.edu.br', password: 'password' },
    { role: 'Coordenador', email: 'coordenador@sabercon.edu.br', password: 'password' },
    { role: 'Professor', email: 'professor@sabercon.edu.br', password: 'password' },
    { role: 'Aluna', email: 'julia.c@ifsp.com', password: 'password' },
    { role: 'Responsável', email: 'renato@gmail.com', password: 'password' }
  ];

  // Componente para dispositivos desktop
  const DesktopCredentials = () => (
    <div
      className="hidden lg:block fixed left-4 top-4 z-50 w-64 p-3 rounded-xl border backdrop-blur-sm shadow-lg"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderColor: `${theme.colors.primary.DEFAULT}20`,
        opacity: 0.75,
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.06)'
      }}
    >
      <h3 className="text-sm font-semibold mb-4 text-center px-2 py-1 rounded-lg" style={{ 
        color: theme.colors.primary.DEFAULT,
        backgroundColor: `${theme.colors.primary.DEFAULT}10`,
        border: `1px solid ${theme.colors.primary.DEFAULT}25`
      }}>
        Credenciais
      </h3>
      <div className="space-y-3">
        {credentials.map((credential, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onCredentialSelect(credential.email, credential.password)}
            className="w-full flex items-center justify-between p-3 rounded-lg border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: theme.colors.border.light,
              color: theme.colors.text.secondary,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
            }}
            title="Clique para preencher automaticamente"
          >
            <div className="text-left">
              <div className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>
                {credential.role}
              </div>
              <div className="text-xs opacity-80" style={{ color: theme.colors.text.secondary }}>
                {credential.email}
              </div>
            </div>
            <span className="material-symbols-outlined text-sm opacity-60">
              login
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // Componente para dispositivos móveis
  const MobileCredentials = () => (
    <>
      {/* Botão flutuante para abrir o modal */}
      <div
        className="lg:hidden fixed right-4 bottom-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: theme.colors.primary.DEFAULT,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onClick={() => setIsOpen(true)}
      >
        <span className="material-symbols-outlined text-white">
          key
        </span>
      </div>

      {/* Modal de credenciais */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <div
            className="relative z-10 bg-white rounded-xl shadow-xl p-4 w-full max-w-xs max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: theme.colors.primary.DEFAULT }}>
                Credenciais
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>
            
            <div className="space-y-3">
              {credentials.map((credential, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onCredentialSelect(credential.email, credential.password);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: theme.colors.border.light,
                    color: theme.colors.text.secondary,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold" style={{ color: theme.colors.text.primary }}>
                      {credential.role}
                    </div>
                    <div className="text-xs opacity-80" style={{ color: theme.colors.text.secondary }}>
                      {credential.email}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-60">
                    login
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {!isMobile ? <DesktopCredentials /> : <MobileCredentials />}
    </>
  );
} 