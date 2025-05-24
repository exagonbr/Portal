'use client';

import { LoginForm } from '../../components/auth/LoginForm';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-start">
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-text-primary">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary hover:text-primary-dark">
              Registre-se
            </Link>
          </p>
        </div>

        <LoginForm />

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-dark"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
}
