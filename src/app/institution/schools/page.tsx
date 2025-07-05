import { Suspense } from 'react';
import { SchoolsList } from './components/SchoolsList';
import { SchoolsHeader } from './components/SchoolsHeader';
import { getSchoolsData, getInstitutionsData } from '@/utils/server-component-helpers';

// FIXED: Use optimized server-side data fetching with proper caching
export default async function InstitutionSchoolsPage() {
  try {
    // FIXED: Fetch data in parallel with proper error handling
    const [schools, institutions] = await Promise.allSettled([
      getSchoolsData(),
      getInstitutionsData()
    ]);

    // Handle schools data
    const schoolsData = schools.status === 'fulfilled' ? schools.value : [];
    if (schools.status === 'rejected') {
      console.error('Erro ao carregar escolas:', schools.reason);
    }

    // Handle institutions data
    const institutionsData = institutions.status === 'fulfilled' ? institutions.value : [];
    if (institutions.status === 'rejected') {
      console.error('Erro ao carregar instituições:', institutions.reason);
    }

    // Calculate stats safely
    const stats = {
      total: schoolsData.length,
      active: schoolsData.filter((s: any) => s.status === 'active').length,
      totalStudents: schoolsData.reduce((acc: number, s: any) => acc + (s.studentsCount || 0), 0),
      totalTeachers: schoolsData.reduce((acc: number, s: any) => acc + (s.teachersCount || 0), 0)
    };

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Suspense fallback={<div>Carregando cabeçalho...</div>}>
          <SchoolsHeader stats={stats} />
        </Suspense>

        <Suspense fallback={<div>Carregando escolas...</div>}>
          <SchoolsList 
            initialSchools={schoolsData}
            institutions={institutionsData}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Erro crítico na página de escolas:', error);
    
    // Return error state
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600">
            Ocorreu um erro ao carregar as informações das escolas. 
            Tente recarregar a página.
          </p>
        </div>
      </div>
    );
  }
}
