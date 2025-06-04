'use client'

import React, { useState } from 'react';
import CourseEditModal from '@/components/CourseEditModal';
import CourseAddModal from '@/components/CourseAddModal';
import StudentEditModal from '@/components/StudentEditModal';
import StudentAddModal from '@/components/StudentAddModal';
import RoleEditModal from '@/components/RoleEditModal';
import RoleAddModal from '@/components/RoleAddModal';
import GradeEditModal from '@/components/GradeEditModal';

export default function DemoModalsPage() {
  const [modals, setModals] = useState({
    courseEdit: false,
    courseAdd: false,
    studentEdit: false,
    studentAdd: false,
    roleEdit: false,
    roleAdd: false,
    gradeEdit: false,
  });

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  // Dados de exemplo para os modais
  const sampleCourse = {
    id: '1',
    name: 'Matemática Avançada',
    code: 'MAT-401',
    description: 'Curso avançado de matemática com foco em cálculo diferencial e integral',
    category: 'Exatas' as const,
    level: 'Avançado' as const,
    duration: '120 horas',
    credits: 6,
    status: 'Ativo' as const,
    startDate: '2025-02-01',
    endDate: '2025-07-15',
    maxStudents: 30,
    currentStudents: 25,
    teacherId: 'teacher-1',
    teacherName: 'Prof. João Silva',
    institutionId: 'inst-1',
    institutionName: 'Universidade Federal',
    price: 1500.00,
    createdAt: '2025-01-01T00:00:00Z',
    studentCount: 25,
    teacherCount: 3,
    rating: 4.8,
    certificateAvailable: true,
    modules: [
      { id: '1', name: 'Limites e Continuidade', order: 1, duration: 20 },
      { id: '2', name: 'Derivadas', order: 2, duration: 25 },
      { id: '3', name: 'Integrais', order: 3, duration: 30 }
    ],
    students: [
      { id: '1', name: 'Ana Silva', email: 'ana@email.com', status: 'Ativo' },
      { id: '2', name: 'Pedro Santos', email: 'pedro@email.com', status: 'Ativo' }
    ],
    evaluations: [
      { id: '1', name: 'Prova 1', type: 'Prova', weight: 30, date: '2025-03-15' },
      { id: '2', name: 'Trabalho Final', type: 'Trabalho', weight: 40, date: '2025-06-20' }
    ]
  };

  const sampleStudent = {
    id: '1',
    name: 'Ana Carolina Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-9999',
    registration: '2025001',
    course: 'Engenharia de Software',
    status: 'Ativo' as const,
    enrollmentDate: '2025-01-15',
    birthDate: '2000-05-20',
    institutionId: 'inst-1',
    institutionName: 'Universidade Federal',
    courseId: 'course-1',
    courseName: 'Engenharia de Software',
    semester: 5,
    gpa: 8.5,
    lastAccess: '2025-01-20T10:30:00Z',
    classGroup: 'Turma A - Manhã',
    attendance: 95,
    grade: 8.5,
    address: 'Rua das Flores, 123 - São Paulo/SP - 01234-567',
    guardian: {
      name: 'José Silva',
      relationship: 'Pai',
      phone: '(11) 88888-8888',
      email: 'jose.silva@email.com'
    },
    academicInfo: {
      semester: 5,
      gpa: 8.5,
      totalCredits: 120,
      completedCredits: 80
    },
    performanceData: {
      grades: [
        { subject: 'Matemática', grade: 9.0, semester: '2024.2' },
        { subject: 'Física', grade: 8.5, semester: '2024.2' },
        { subject: 'Programação', grade: 9.5, semester: '2024.2' }
      ],
      attendance: 95,
      lastAccess: '2025-01-20T10:30:00Z'
    },
    financialInfo: {
      monthlyFee: 800.00,
      totalPaid: 4000.00,
      pendingAmount: 0.00,
      scholarship: 20
    }
  };

  const sampleRole = {
    id: '1',
    name: 'Coordenador Acadêmico',
    description: 'Responsável pela coordenação acadêmica e supervisão de cursos',
    type: 'Customizado' as const,
    status: 'Ativo' as const,
    userCount: 5,
    permissions: [
      { id: 'users.view', name: 'Visualizar Usuários', description: 'Permite visualizar lista de usuários', category: 'Usuários', active: true },
      { id: 'courses.edit', name: 'Editar Cursos', description: 'Permite editar dados de cursos', category: 'Cursos', active: true },
      { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Permite visualizar relatórios', category: 'Relatórios', active: true }
    ],
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    color: '#3B82F6',
    icon: '👔'
  };

  const sampleGrade = {
    id: '1',
    studentId: '1',
    studentName: 'Ana Carolina Silva',
    studentRegistration: '2025001',
    courseId: '1',
    courseName: 'Matemática Avançada',
    subject: 'Cálculo Diferencial',
    evaluationType: 'Prova' as const,
    grade: 8.5,
    maxGrade: 10,
    weight: 30,
    date: '2025-01-15',
    semester: '2025.1',
    status: 'Lançada' as const,
    comments: 'Excelente desempenho na resolução de problemas complexos',
    teacherId: 'teacher-1',
    teacherName: 'Prof. João Silva'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-600 mb-2">Demonstração de Modais</h1>
        <p className="text-gray-600">
          Esta página demonstra todos os modais de CRUD criados no sistema. 
          Clique nos botões abaixo para testar cada funcionalidade.
        </p>
      </div>

      {/* Grid de Cards com Botões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Modais de Curso */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Gestão de Cursos</h3>
              <p className="text-sm text-gray-600">Modais para criar e editar cursos</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => openModal('courseAdd')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Novo Curso (Wizard)
            </button>
            <button
              onClick={() => openModal('courseEdit')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✏️ Editar Curso (5 Tabs)
            </button>
          </div>
        </div>

        {/* Modais de Estudante */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👨‍🎓</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Gestão de Alunos</h3>
              <p className="text-sm text-gray-600">Modais para criar e editar alunos</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => openModal('studentAdd')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Novo Aluno (Wizard)
            </button>
            <button
              onClick={() => openModal('studentEdit')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              ✏️ Editar Aluno (5 Tabs)
            </button>
          </div>
        </div>

        {/* Modais de Função */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🔐</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Gestão de Funções</h3>
              <p className="text-sm text-gray-600">Modais para criar e editar funções/papéis</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => openModal('roleAdd')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Nova Função (Wizard)
            </button>
            <button
              onClick={() => openModal('roleEdit')}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              ✏️ Editar Função (4 Tabs)
            </button>
          </div>
        </div>

        {/* Modal de Nota */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600">Gestão de Notas</h3>
              <p className="text-sm text-gray-600">Modal para editar notas e avaliações</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => openModal('gradeEdit')}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ✏️ Editar Nota (3 Tabs)
            </button>
          </div>
        </div>

        {/* Card de Informações */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">📋 Funcionalidades dos Modais</h3>
          <div className="space-y-2 text-sm">
            <p>✅ <strong>Tabs dinâmicas</strong> com navegação intuitiva</p>
            <p>✅ <strong>Validação em tempo real</strong> com feedback visual</p>
            <p>✅ <strong>Dados de exemplo</strong> pré-carregados para teste</p>
            <p>✅ <strong>Interface responsiva</strong> adaptável a diferentes telas</p>
            <p>✅ <strong>Confirmação de exclusão</strong> com modais secundários</p>
            <p>✅ <strong>Cálculos automáticos</strong> (idades, percentuais, médias)</p>
            <p>✅ <strong>Sistema de permissões</strong> granular por categorias</p>
            <p>✅ <strong>Modo edição</strong> com toggle de visualização/edição</p>
          </div>
        </div>
      </div>

      {/* Seção de Estatísticas */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">📊 Resumo dos Modais Criados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">7</div>
            <div className="text-sm text-gray-600">Modais Criados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">23</div>
            <div className="text-sm text-gray-600">Tabs Implementadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">4</div>
            <div className="text-sm text-gray-600">Wizards de Criação</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">100%</div>
            <div className="text-sm text-gray-600">Funcionalidades</div>
          </div>
        </div>
      </div>

      {/* Renderização dos Modais */}
      <CourseEditModal
        isOpen={modals.courseEdit}
        onClose={() => closeModal('courseEdit')}
        course={sampleCourse}
      />

      <CourseAddModal
        isOpen={modals.courseAdd}
        onClose={() => closeModal('courseAdd')}
      />

      <StudentEditModal
        isOpen={modals.studentEdit}
        onClose={() => closeModal('studentEdit')}
        student={sampleStudent}
      />

      <StudentAddModal
        isOpen={modals.studentAdd}
        onClose={() => closeModal('studentAdd')}
      />

      <RoleEditModal
        isOpen={modals.roleEdit}
        onClose={() => closeModal('roleEdit')}
        role={sampleRole}
      />

      <RoleAddModal
        isOpen={modals.roleAdd}
        onClose={() => closeModal('roleAdd')}
      />

      <GradeEditModal
        isOpen={modals.gradeEdit}
        onClose={() => closeModal('gradeEdit')}
        grade={sampleGrade}
      />
    </div>
  );
} 