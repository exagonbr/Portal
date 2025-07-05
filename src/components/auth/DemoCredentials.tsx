'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

interface DemoCredentialsProps {
  onCredentialSelect: (email: string, password: string) => void;
}

export function DemoCredentials({ onCredentialSelect }: DemoCredentialsProps) {
  const { theme } = useTheme();

  const credentials = [
    { role: 'Admin', email: 'admin@sabercon.edu.br', password: 'password' },
    { role: 'Gestor', email: 'gestor@sabercon.edu.br', password: 'password' },
    { role: 'Coordenador', email: 'coordenador@sabercon.edu.br', password: 'password' },
    { role: 'Professor', email: 'professor@sabercon.edu.br', password: 'password' },
    { role: 'Aluna', email: 'julia.c@ifsp.com', password: 'password' },
    { role: 'Responsável', email: 'renato@gmail.com', password: 'password' }
  ];

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 z-50 w-64 p-3 rounded-xl border backdrop-blur-sm hover:opacity-100 transition-all duration-300 shadow-lg"
      style={{
        backgroundColor: `${theme.colors.primary.DEFAULT}20`,
        borderColor: `${theme.colors.primary.DEFAULT}50`,
        opacity: 0.95,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
      }}
    >
      <h3 className="text-sm font-semibold mb-4 text-center px-2 py-1 rounded-lg" style={{ 
        color: theme.colors.text.primary,
        backgroundColor: `${theme.colors.primary.DEFAULT}15`,
        border: `1px solid ${theme.colors.primary.DEFAULT}30`
      }}>
        Credenciais Demo
      </h3>
      <div className="space-y-2">
        {credentials.map((credential, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onCredentialSelect(credential.email, credential.password)}
            className="w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.DEFAULT,
              color: theme.colors.text.secondary,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            title="Clique para preencher automaticamente"
          >
            <div className="text-left">
              <div className="text-xs font-medium" style={{ color: theme.colors.text.primary }}>
                {credential.role}
              </div>
              <div className="text-xs opacity-75">
                {credential.email}
              </div>
            </div>
            <span className="material-symbols-outlined text-sm opacity-60">
              login
            </span>
          </button>
        ))}
      </div>
    </MotionDiv>
  );
} 