'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

interface PortalLayoutProps {
    children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Conteúdo Principal */}
            <main className="min-h-screen w-full">
                {children}
            </main>
        </div>
    );
} 