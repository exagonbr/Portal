import { Suspense } from 'react';
import { SchoolsList } from './components/SchoolsList';
import { SchoolsHeader } from './components/SchoolsHeader';
import { unitService } from '@/services/unitService';
import { institutionService } from '@/services/institutionService';

// Server-side data fetching with caching
async function getSchoolsData() {
  const filters = {
    type: 'ESCOLA'
  };
  
  // Use fetch with cache control
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units?${new URLSearchParams(filters)}`, {
    next: {
      revalidate: 300 // Revalidate every 5 minutes
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch schools');
  }
  
  const data = await response.json();
  
  // Transform data for UI
  return data.items.map((unit: any) => ({
    ...unit,
    principal: 'Diretor', // Default value or to be filled later
    studentsCount: Math.floor(Math.random() * 500),
    teachersCount: Math.floor(Math.random() * 50),
    classesCount: Math.floor(Math.random() * 30),
    type: ['elementary', 'middle', 'high', 'technical'][Math.floor(Math.random() * 4)],
    status: unit.active ? 'active' : 'inactive',
    address: {
      street: '',
      number: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contact: {
      phone: unit.description || '',
      email: '',
      website: ''
    }
  }));
}

// Server-side data fetching for institutions
async function getInstitutions() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions`, {
    next: {
      revalidate: 3600 // Revalidate every hour
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch institutions');
  }
  
  return response.json();
}

export default async function InstitutionSchoolsPage() {
  // Fetch data in parallel
  const [schools, institutions] = await Promise.all([
    getSchoolsData(),
    getInstitutions()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Suspense fallback={<div>Loading header...</div>}>
        <SchoolsHeader stats={{
          total: schools.length,
          active: schools.filter((s: any) => s.status === 'active').length,
          totalStudents: schools.reduce((acc: number, s: any) => acc + s.studentsCount, 0),
          totalTeachers: schools.reduce((acc: number, s: any) => acc + s.teachersCount, 0)
        }} />
      </Suspense>

      <Suspense fallback={<div>Loading schools...</div>}>
        <SchoolsList 
          initialSchools={schools}
          institutions={institutions}
        />
      </Suspense>
    </div>
  );
}
