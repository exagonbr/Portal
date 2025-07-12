'use client';

import { useState } from 'react';
import AuthorManager from '@/components/content/AuthorManager';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';

export default function AuthorsPage() {
  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/content">
            Gestão de Conteúdo
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Autores</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Autores</h1>
      </div>

      <AuthorManager />
    </div>
  );
} 