'use client'

import dynamic from 'next/dynamic'

// Importar o componente diretamente usando dynamic import
const AuthorsPageContent = dynamic(() => import('./AuthorsPageContent'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Carregando autores...</span>
    </div>
  ),
  ssr: false
})

export default function AuthorsPage() {
<<<<<<< HEAD
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
=======
  return <AuthorsPageContent />
>>>>>>> 2b9a658619be4be8442857987504eeff79e3f6b9
} 