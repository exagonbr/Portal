import { Suspense } from 'react';
import { TeachersList } from './components/TeachersList';
import { TeachersHeader } from './components/TeachersHeader';
import { getTeachersData } from '@/utils/server-component-helpers';

// FIXED: Use optimized server-side data fetching with proper caching
export default async function TeachersPage() {
  try {
    // FIXED: Use cached data fetching with error handling
    const teachers = await getTeachersData();

    // Calculate stats safely
    const stats = {
      total: teachers.length,
      active: teachers.filter((t: any) => t.status === 'active').length,
      totalClasses: teachers.reduce((acc: number, t: any) => acc + (t.classes?.length || 0), 0),
      avgExperience: teachers.length > 0 
        ? Math.round(teachers.reduce((acc: number, t: any) => acc + (t.experience || 0), 0) / teachers.length)
        : 0
    };

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Suspense fallback={<div>Carregando cabeçalho...</div>}>
          <TeachersHeader stats={stats} />
        </Suspense>

        <Suspense fallback={<div>Carregando professores...</div>}>
          <TeachersList initialTeachers={teachers} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Erro crítico na página de professores:', error);
    
    // Return error state
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600">
            Ocorreu um erro ao carregar as informações dos professores. 
            Tente recarregar a página.
          </p>
        </div>
      </div>
    );
  }
}
