'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Search,
  Calendar,
  Clock,
  UserCheck,
  GraduationCap,
  CheckCircle,
  XCircle,
  School,
  BookOpen
} from 'lucide-react';
import { classService } from '@/services/classService';
import { schoolService } from '@/services/schoolService';
import { Class, CreateClassData, UpdateClassData, SHIFT_LABELS } from '@/types/class';
import { School as SchoolType } from '@/types/school';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function InstitutionClassesPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [classes, setClasses] = useState<Class[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [filterShift, setFilterShift] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'full'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // Simular dados por enquanto
      const mockClasses: Class[] = [
        {
          id: '1',
          name: 'Turma A',
          code: '5A-MAT-2024',
          schoolId: '1',
          schoolName: 'Escola Municipal Dom Pedro I',
          grade: '5º Ano',
          shift: 'morning',
          academicYear: 2024,
          teacher: { id: '1', name: 'Prof. Maria Silva' },
          studentsCount: 28,
          maxStudents: 30,
          subjects: ['Matemática', 'Português', 'Ciências', 'História', 'Geografia'],
          schedule: [
            { day: 'Segunda', startTime: '07:30', endTime: '12:00' },
            { day: 'Terça', startTime: '07:30', endTime: '12:00' },
            { day: 'Quarta', startTime: '07:30', endTime: '12:00' },
            { day: 'Quinta', startTime: '07:30', endTime: '12:00' },
            { day: 'Sexta', startTime: '07:30', endTime: '12:00' }
          ],
          status: 'active',
          createdAt: new Date('2024-02-01')
        },
        {
          id: '2',
          name: 'Turma B',
          code: '5B-MAT-2024',
          schoolId: '1',
          schoolName: 'Escola Municipal Dom Pedro I',
          grade: '5º Ano',
          shift: 'afternoon',
          academicYear: 2024,
          teacher: { id: '2', name: 'Prof. João Santos' },
          studentsCount: 25,
          maxStudents: 30,
          subjects: ['Matemática', 'Português', 'Ciências', 'História', 'Geografia'],
          schedule: [
            { day: 'Segunda', startTime: '13:00', endTime: '17:30' },
            { day: 'Terça', startTime: '13:00', endTime: '17:30' },
            { day: 'Quarta', startTime: '13:00', endTime: '17:30' },
            { day: 'Quinta', startTime: '13:00', endTime: '17:30' },
            { day: 'Sexta', startTime: '13:00', endTime: '17:30' }
          ],
          status: 'active',
          createdAt: new Date('2024-02-01')
        },
        {
          id: '3',
          name: 'Turma 3A',
          code: '3EM-A-2024',
          schoolId: '2',
          schoolName: 'Colégio Estadual Santos Dumont',
          grade: '3º Ano EM',
          shift: 'morning',
          academicYear: 2024,
          teacher: { id: '3', name: 'Prof. Ana Costa' },
          studentsCount: 35,
          maxStudents: 35,
          subjects: ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'História'],
          schedule: [
            { day: 'Segunda', startTime: '07:00', endTime: '12:30' },
            { day: 'Terça', startTime: '07:00', endTime: '12:30' },
            { day: 'Quarta', startTime: '07:00', endTime: '12:30' },
            { day: 'Quinta', startTime: '07:00', endTime: '12:30' },
            { day: 'Sexta', startTime: '07:00', endTime: '12:30' }
          ],
          status: 'active',
          createdAt: new Date('2024-02-01')
        },
        {
          id: '4',
          name: 'Turma TI-2',
          code: 'TI2-2024',
          schoolId: '3',
          schoolName: 'Instituto Técnico Industrial',
          grade: '2º Módulo',
          shift: 'evening',
          academicYear: 2024,
          teacher: { id: '4', name: 'Prof. Carlos Oliveira' },
          studentsCount: 20,
          maxStudents: 25,
          subjects: ['Programação', 'Banco de Dados', 'Redes', 'Sistemas Operacionais'],
          schedule: [
            { day: 'Segunda', startTime: '19:00', endTime: '22:30' },
            { day: 'Terça', startTime: '19:00', endTime: '22:30' },
            { day: 'Quarta', startTime: '19:00', endTime: '22:30' },
            { day: 'Quinta', startTime: '19:00', endTime: '22:30' },
            { day: 'Sexta', startTime: '19:00', endTime: '22:30' }
          ],
          status: 'active',
          createdAt: new Date('2024-02-01')
        }
      ];
      
      setClasses(mockClasses);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = filterSchool === 'all' || classItem.schoolId === filterSchool;
    const matchesShift = filterShift === 'all' || classItem.shift === filterShift;
    const matchesStatus = filterStatus === 'all' || classItem.status === filterStatus;
    
    return matchesSearch && matchesSchool && matchesShift && matchesStatus;
  });

  const getShiftLabel = (shift: string) => {
    const labels = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      evening: 'Noite',
      full: 'Integral'
    };
    return labels[shift as keyof typeof labels] || shift;
  };

  const getShiftColor = (shift: string) => {
    const colors = {
      morning: theme.colors.status.info,
      afternoon: theme.colors.status.warning,
      evening: theme.colors.primary.DEFAULT,
      full: theme.colors.status.success
    };
    return colors[shift as keyof typeof colors] || theme.colors.text.secondary;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: theme.colors.status.success,
      inactive: theme.colors.status.error,
      completed: theme.colors.text.tertiary
    };
    return colors[status as keyof typeof colors] || theme.colors.text.secondary;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativa',
      inactive: 'Inativa',
      completed: 'Concluída'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return theme.colors.status.error;
    if (percentage >= 70) return theme.colors.status.warning;
    return theme.colors.status.success;
  };

  const schools = Array.from(new Set(classes.map(c => ({ id: c.schoolId, name: c.schoolName })));

  const stats = {
    total: classes.length,
    active: classes.filter(c => c.status === 'active').length,
    totalStudents: classes.reduce((acc, c) => acc + c.studentsCount, 0),
    totalCapacity: classes.reduce((acc, c) => acc + c.maxStudents, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: theme.colors.primary.DEFAULT }}></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
              Gestão de Turmas
            </h1>
            <p style={{ color: theme.colors.text.secondary }}>
              Gerencie as turmas das escolas
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              color: 'white'
            }}
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Nova Turma
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="p-4 rounded-lg border"
             style={{ backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.DEFAULT }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"
                 style={{ backgroundColor: theme.colors.primary.light + '20' }}>
              <span className="material-symbols-outlined text-2xl"
                    style={{ color: theme.colors.primary.DEFAULT }}>
                class
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Total de Turmas</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border"
             style={{ backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.DEFAULT }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"
                 style={{ backgroundColor: theme.colors.status.success + '20' }}>
              <span className="material-symbols-outlined text-2xl"
                    style={{ color: theme.colors.status.success }}>
                check_circle
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Turmas Ativas</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border"
             style={{ backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.DEFAULT }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"
                 style={{ backgroundColor: theme.colors.status.info + '20' }}>
              <span className="material-symbols-outlined text-2xl"
                    style={{ color: theme.colors.status.info }}>
                group
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Total de Alunos</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border"
             style={{ backgroundColor: theme.colors.background.card, borderColor: theme.colors.border.DEFAULT }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"
                 style={{ backgroundColor: theme.colors.status.warning + '20' }}>
              <span className="material-symbols-outlined text-2xl"
                    style={{ color: theme.colors.status.warning }}>
                event_seat
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Ocupação</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                {Math.round((stats.totalStudents / stats.totalCapacity) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex flex-col md:flex-row gap-4"
      >
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: theme.colors.text.secondary }}>
              search
            </span>
            <input
              type="text"
              placeholder="Buscar turmas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.DEFAULT,
                color: theme.colors.text.primary
              }}
            />
          </div>
        </div>

        {/* Filtro por Escola */}
        <select
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT,
            color: theme.colors.text.primary
          }}
        >
          <option value="all">Todas as Escolas</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>

        {/* Filtro por Turno */}
        <select
          value={filterShift}
          onChange={(e) => setFilterShift(e.target.value as any)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT,
            color: theme.colors.text.primary
          }}
        >
          <option value="all">Todos os Turnos</option>
          <option value="morning">Manhã</option>
          <option value="afternoon">Tarde</option>
          <option value="evening">Noite</option>
          <option value="full">Integral</option>
        </select>

        {/* Filtro por Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT,
            color: theme.colors.text.primary
          }}
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
          <option value="completed">Concluídas</option>
        </select>
      </motion.div>

      {/* Lista de Turmas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClasses.map((classItem, index) => (
          <motion.div
            key={classItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: theme.colors.background.card,
              borderWidth: '1px',
              borderColor: theme.colors.border.DEFAULT
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between"
                 style={{ backgroundColor: theme.colors.background.secondary }}>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                  {classItem.name} - {classItem.grade}
                </h3>
                <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  {classItem.schoolName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getShiftColor(classItem.shift) + '20',
                        color: getShiftColor(classItem.shift)
                      }}>
                  {getShiftLabel(classItem.shift)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getStatusColor(classItem.status) + '20',
                        color: getStatusColor(classItem.status)
                      }}>
                  {getStatusLabel(classItem.status)}
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Professor */}
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Professor(a)</p>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    {classItem.teacher.name}
                  </p>
                </div>

                {/* Código */}
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Código</p>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    {classItem.code}
                  </p>
                </div>

                {/* Ano Letivo */}
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Ano Letivo</p>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    {classItem.academicYear}
                  </p>
                </div>

                {/* Ocupação */}
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Ocupação</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium" style={{ color: getOccupancyColor(classItem.studentsCount, classItem.maxStudents) }}>
                      {classItem.studentsCount}/{classItem.maxStudents}
                    </p>
                    <div className="flex-1 h-2 rounded-full overflow-hidden"
                         style={{ backgroundColor: theme.colors.border.light }}>
                      <div className="h-full rounded-full transition-all duration-500"
                           style={{
                             width: `${(classItem.studentsCount / classItem.maxStudents) * 100}%`,
                             backgroundColor: getOccupancyColor(classItem.studentsCount, classItem.maxStudents)
                           }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Disciplinas */}
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: theme.colors.text.tertiary }}>Disciplinas</p>
                <div className="flex flex-wrap gap-2">
                  {classItem.subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: theme.colors.primary.light + '20',
                        color: theme.colors.primary.DEFAULT
                      }}
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Horário */}
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: theme.colors.text.tertiary }}>Horário</p>
                <div className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  {classItem.schedule[0].day} a {classItem.schedule[classItem.schedule.length - 1].day} • 
                  {classItem.schedule[0].startTime} às {classItem.schedule[0].endTime}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Link
                  href={`/institution/classes/${classItem.id}`}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-center text-sm transition-colors"
                  style={{
                    backgroundColor: theme.colors.primary.DEFAULT,
                    color: 'white'
                  }}
                >
                  Gerenciar
                </Link>
                <Link
                  href={`/institution/classes/${classItem.id}/students`}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border"
                  style={{
                    borderColor: theme.colors.primary.DEFAULT,
                    color: theme.colors.primary.DEFAULT
                  }}
                >
                  Ver Alunos
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="material-symbols-outlined text-6xl mb-4"
                style={{ color: theme.colors.text.tertiary }}>
            class
          </span>
          <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
            Nenhuma turma encontrada
          </p>
        </motion.div>
      )}
    </div>
  );
}
