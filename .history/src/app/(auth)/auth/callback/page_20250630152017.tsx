'use client';

import { useEffect, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { MotionDiv } from '@/components/ui/MotionWrapper';
import { getTheme } from '@/config/themes';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const theme = getTheme('academic'); // Use a default theme

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      login(token);
      router.push('/dashboard/student'); // Redirect to a default dashboard
    } else {
      router.push('/auth/login?error=auth_failed');
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background.primary }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <MotionDiv
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto"
            style={{ borderColor: theme.colors.primary.DEFAULT }}
          />
          <p className="mt-2" style={{ color: theme.colors.text.secondary }}>
            Autenticando...
          </p>
        </div>
      </div>
    </div>
  );
}