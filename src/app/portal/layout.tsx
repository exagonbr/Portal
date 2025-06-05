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
        <div className="min-h-screen bg-background-secondary">
            {/* Conteúdo Principal */}
            <main className="container mx-auto px-0 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {children}
            </main>
        </div>
    );
} 