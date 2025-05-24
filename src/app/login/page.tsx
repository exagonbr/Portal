'use client';

import LoginForm from '../../components/auth/LoginForm';
import Link from 'next/link';
import Image from 'next/image';

export default function Login() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7FAFC] to-[#EDF2F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <Image
              src="/sabercon-logo.png"
              alt="Sabercon"
              width={400}
              height={80}
              className="mx-auto mb-3"
              priority
            />
          </Link>
        </div>

        <LoginForm />

        <div className="mt-8 p-5 bg-gradient-to-br from-[#F8FAFC] to-[#EDF2F7] rounded-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-[#1B365D] mb-3">Credenciais de teste:</h3>
          <div className="space-y-2.5 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Professor:</span>
              <span>ricardo.oliveira@edu.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Aluno:</span>
              <span>julia.c@edu.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Senha:</span>
              <span>teste123</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
