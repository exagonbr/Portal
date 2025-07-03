import React, { useState } from 'react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  schoolId?: string;
  schoolName?: string;
  subjects?: string[];
  classes?: Array<{
    id: string;
    name: string;
    grade: string;
  }>;
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  experience?: number;
  status: 'active' | 'inactive';
  joinDate?: Date;
}

interface TeachersListProps {
  initialTeachers: Teacher[];
}

export function TeachersList({ initialTeachers }: TeachersListProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Get unique subjects for filter
  const allSubjects = Array.from(
    new Set(
      teachers.flatMap(teacher => teacher.subjects || [])
    )
  ).sort();

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.schoolName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
    const matchesSubject = filterSubject === 'all' || 
                          (teacher.subjects && teacher.subjects.includes(filterSubject));
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar professores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="all">Todas as Matérias</option>
          {allSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Teachers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="rounded-lg shadow-lg p-4 border">
            <h3 className="text-lg font-semibold mb-1">{teacher.name}</h3>
            <p className="text-sm mb-2">Email: {teacher.email}</p>
            {teacher.phone && (
              <p className="text-sm mb-2">Telefone: {teacher.phone}</p>
            )}
            {teacher.schoolName && (
              <p className="text-sm mb-2">Escola: {teacher.schoolName}</p>
            )}
            <p className="text-sm mb-2">
              Status: {teacher.status === 'active' ? 'Ativo' : 'Inativo'}
            </p>
            
            {teacher.subjects && teacher.subjects.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium">Matérias:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacher.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-semibold">{teacher.classes?.length || 0}</p>
                <p className="text-xs text-gray-600">Turmas</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-semibold">{teacher.experience || 0}</p>
                <p className="text-xs text-gray-600">Anos</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">Nenhum professor encontrado</p>
        </div>
      )}
    </div>
  );
} 