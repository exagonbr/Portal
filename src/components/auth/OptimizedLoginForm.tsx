'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OptimizedLoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function OptimizedLoginForm({ onSuccess, className = '' }: OptimizedLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useOptimizedAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        onSuccess?.();
      }
    } catch (err) {
      console.error('Erro no login:', err);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Login Otimizado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Entre com suas credenciais
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="pl-10 pr-10"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Sistema de autenticação otimizado com JWT
        </div>
      </div>
    </div>
  );
}

// Componente simples para teste rápido
export function OptimizedLoginTest() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Teste de Login Otimizado</h3>
        <p className="text-gray-600">Use: admin@sabercon.edu.br / password123</p>
      </div>
      
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          Testar Login Otimizado
        </Button>
      ) : (
        <OptimizedLoginForm onSuccess={() => setShowForm(false)} />
      )}
    </div>
  );
} 