'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { mockTeachers, mockCourses, mockStudents, mockLiveClasses, mockAssignments } from '../../../constants/mockData';
import { StatCard } from '../../../components/dashboard/StatCard';
import { User } from '../../../types/auth';
import { Course } from '../../../types/education';
import { BRAZILIAN_EDUCATION } from '../../../constants/brazilianEducation';
import { LessonPlan, ClassGroup } from '../../../types/brazilianEducation';
import LessonPlanManager from '../../../components/LessonPlanManager';
import ClassGroupManager from '../../../components/ClassGroupManager';

interface SimplifiedStudent {
  id: string;
  name: string;
  email: string;
  progress: number;
  grades: {
    assignments: number;
    tests: number;
    participation: number;
  };
  enrolledCourses: string[];
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  courses: string[];
  department: string;
  availability: {
    days: string[];
    hours: string;
  };
}

interface LiveClass {
  id: string;
  courseId: string;
  title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  meetingUrl: string;
  description?: string;
  materials?: string[];
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  type: 'homework' | 'project' | 'quiz';
  status: 'active' | 'past' | 'draft';
}

type TabType = 'overview' | 'lesson-plans' | 'class-groups';

const TeacherDashboard = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof BRAZILIAN_EDUCATION | ''>('');

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'teacher' && user.type !== 'teacher'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user || (user.role !== 'teacher' && user.type !== 'teacher')) {
    return null;
  }

  const teacher = mockTeachers.find(t => t.id === user.id);
  const teacherCourses = mockCourses.filter(course => teacher?.courses.includes(course.id));
  const upcomingClasses = mockLiveClasses.filter(
    liveClass => teacher?.courses.includes(liveClass.courseId) && liveClass.status === 'scheduled'
  );
  const activeAssignments = mockAssignments.filter(
    assignment => teacher?.courses.includes(assignment.courseId) && assignment.status === 'active'
  );
  const teacherStudents = mockStudents.filter(student => 
    student.enrolledCourses.some(courseId => teacher?.courses.includes(courseId))
  );

  const handleSaveLessonPlan = (plan: LessonPlan) => {
    console.log('Saving lesson plan:', plan);
  };

  const handleSaveClassGroup = (classGroup: ClassGroup) => {
    console.log('Saving class group:', classGroup);
  };

  const filterStudentsByLevel = (level: keyof typeof BRAZILIAN_EDUCATION) => {
    return teacherStudents;
  };

  const NavButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button 
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-primary text-white font-medium shadow-md' 
          : 'text-text-secondary hover:bg-background-start'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background-start">
      <aside className="w-64 bg-white border-r border-border p-6 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Portal do Professor</h2>
          <p className="text-sm text-text-secondary">{user.name}</p>
        </div>
        
        <nav className="space-y-2">
          <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Visão Geral
          </NavButton>
          <NavButton active={activeTab === 'lesson-plans'} onClick={() => setActiveTab('lesson-plans')}>
            Planos de Aula
          </NavButton>
          <NavButton active={activeTab === 'class-groups'} onClick={() => setActiveTab('class-groups')}>
            Turmas
          </NavButton>
          
          <div className="pt-4 space-y-2">
            <Link href="/courses" className="nav-link block">Meus Cursos</Link>
            <Link href="/students" className="nav-link block">Alunos</Link>
            <Link href="/assignments" className="nav-link block">Atividades</Link>
            <Link href="/live" className="nav-link block">Aulas ao Vivo</Link>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary">
              {activeTab === 'overview' && 'Visão Geral'}
              {activeTab === 'lesson-plans' && 'Planos de Aula'}
              {activeTab === 'class-groups' && 'Gerenciamento de Turmas'}
            </h1>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center space-x-4 mb-6">
                <select
                  className="input-field max-w-xs"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as keyof typeof BRAZILIAN_EDUCATION)}
                >
                  <option value="">Todos os níveis</option>
                  {Object.entries(BRAZILIAN_EDUCATION).map(([key, value]) => (
                    <option key={key} value={key}>{value.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Cursos Ativos"
                  value={teacherCourses.length}
                  type="courses"
                  trend={5}
                />
                <StatCard
                  title="Alunos"
                  value={selectedLevel ? filterStudentsByLevel(selectedLevel as keyof typeof BRAZILIAN_EDUCATION).length : teacherStudents.length}
                  type="students"
                  trend={12}
                />
                <StatCard
                  title="Aulas Agendadas"
                  value={upcomingClasses.length}
                  type="classes"
                />
                <StatCard
                  title="Atividades Ativas"
                  value={activeAssignments.length}
                  type="assignments"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <div className="card-header">Próximas Aulas</div>
                  <div className="card-body space-y-4">
                    {upcomingClasses.length === 0 ? (
                      <p className="text-text-secondary text-center py-4">Nenhuma aula agendada</p>
                    ) : (
                      upcomingClasses.map(liveClass => (
                        <div key={liveClass.id} className="flex justify-between items-start p-4 rounded-lg bg-background-start">
                          <div>
                            <h3 className="font-medium text-text-primary">{liveClass.title}</h3>
                            <p className="text-sm text-text-secondary mt-1">
                              {liveClass.date} • {liveClass.time}
                            </p>
                          </div>
                          <Link href={liveClass.meetingUrl} className="button-primary text-sm">
                            Entrar
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">Atividades Recentes</div>
                  <div className="card-body">
                    {activeAssignments.length === 0 ? (
                      <p className="text-text-secondary text-center py-4">Nenhuma atividade ativa</p>
                    ) : (
                      <div className="space-y-4">
                        {activeAssignments.map(assignment => (
                          <div key={assignment.id} className="flex items-center justify-between p-4 rounded-lg bg-background-start">
                            <div>
                              <h3 className="font-medium text-text-primary">{assignment.title}</h3>
                              <p className="text-sm text-text-secondary">Prazo: {assignment.dueDate}</p>
                            </div>
                            <span className="badge badge-success">Ativo</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">Desempenho dos Alunos</div>
                <div className="card-body">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-border">
                          <th className="pb-3 font-medium text-text-secondary">Nome</th>
                          <th className="pb-3 font-medium text-text-secondary">Progresso</th>
                          <th className="pb-3 font-medium text-text-secondary">Média</th>
                          <th className="pb-3 font-medium text-text-secondary">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(selectedLevel ? filterStudentsByLevel(selectedLevel as keyof typeof BRAZILIAN_EDUCATION) : teacherStudents).map(student => {
                          const averageGrade = (
                            (student.grades.assignments + student.grades.tests + student.grades.participation) / 3
                          ).toFixed(1);

                          return (
                            <tr key={student.id} className="hover:bg-background-start">
                              <td className="py-4">
                                <div>
                                  <div className="font-medium text-text-primary">{student.name}</div>
                                  <div className="text-sm text-text-secondary">{student.email}</div>
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="w-48">
                                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${student.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-text-secondary mt-1">{student.progress}%</span>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`font-medium ${
                                  Number(averageGrade) >= 7 ? 'text-success' : 
                                  Number(averageGrade) >= 5 ? 'text-warning' : 'text-error'
                                }`}>
                                  {averageGrade}
                                </span>
                              </td>
                              <td className="py-4">
                                <Link
                                  href={`/students/${student.id}`}
                                  className="text-primary hover:text-primary-dark font-medium"
                                >
                                  Ver detalhes
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lesson-plans' && (
            <div className="card animate-fade-in">
              <div className="card-header">Planos de Aula</div>
              <div className="card-body">
                <LessonPlanManager teacherId={user.id} onSave={handleSaveLessonPlan} />
              </div>
            </div>
          )}

          {activeTab === 'class-groups' && (
            <div className="card animate-fade-in">
              <div className="card-header">Gerenciamento de Turmas</div>
              <div className="card-body">
                <ClassGroupManager teacherId={user.id} onSave={handleSaveClassGroup} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
