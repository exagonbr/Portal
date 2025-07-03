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
import { Class, CreateClassData, UpdateClassData, SHIFT_LABELS, ShiftType } from '@/types/class';
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
  const [filterShift, setFilterShift] = useState<'all' | ShiftType>('all');
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
          name: 'Turma A - 5º Ano',
          code: '5A-MAT-2024',
          school_id: '1',
          year: 2024,
          shift: 'MORNING',
          max_students: 30,
          is_active: true,
          created_at: new Date('2024-02-01'),
          updated_at: new Date('2024-02-01')
        },
        {
          id: '2',
          name: 'Turma B - 5º Ano',
          code: '5B-MAT-2024',
          school_id: '1',
          year: 2024,
          shift: 'AFTERNOON',
          max_students: 30,
          is_active: true,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        },
        {
          id: '3',
          name: 'Turma C - 3º Ano',
          code: 'TC-3A-2024',
          school_id: '1',
          year: 2024,
          shift: 'MORNING',
          max_students: 30,
          is_active: true,
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-10')
        },
        {
          id: '4',
          name: 'Turma D - 1º Ano',
          code: 'TD-1A-2024',
          school_id: '2',
          year: 2024,
          shift: 'EVENING',
          max_students: 25,
          is_active: true,
          created_at: new Date('2024-02-01'),
          updated_at: new Date('2024-02-01')
        }
      ];
      
      setClasses(mockClasses);
      setLoading(false);
    } catch (error) {
      console.log('Erro ao buscar turmas:', error);
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = filterSchool === 'all' || classItem.school_id === filterSchool;
    const matchesShift = filterShift === 'all' || classItem.shift === filterShift;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && classItem.is_active) ||
                         (filterStatus === 'inactive' && !classItem.is_active);
    
    return matchesSearch && matchesSchool && matchesShift && matchesStatus;
  });

  const getShiftLabel = (shift: ShiftType) => {
    return SHIFT_LABELS[shift] || shift;
  };

  const getShiftColor = (shift: ShiftType) => {
    const colors = {
      MORNING: theme.colors.status.info,
      AFTERNOON: theme.colors.status.warning,
      EVENING: theme.colors.primary.DEFAULT,
      FULL_TIME: theme.colors.status.success
    };
    return colors[shift] || theme.colors.text.secondary;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? theme.colors.status.success : theme.colors.status.error;
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Ativa' : 'Inativa';
  };

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return theme.colors.status.error;
    if (percentage >= 70) return theme.colors.status.warning;
    return theme.colors.status.success;
  };

  const stats = {
    total: classes.length,
    active: classes.filter(c => c.is_active).length,
    totalStudents: 0, // Placeholder - implementar quando necessário
    totalCapacity: classes.reduce((sum, c) => sum + c.max_students, 0)
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
          {/* uniqueSchools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          )) */}
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
          <option value="MORNING">Manhã</option>
          <option value="AFTERNOON">Tarde</option>
          <option value="EVENING">Noite</option>
          <option value="FULL_TIME">Integral</option>
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
                  {classItem.name}
                </h3>
                <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  Código: {classItem.code}
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
                        backgroundColor: getStatusColor(classItem.is_active) + '20',
                        color: getStatusColor(classItem.is_active)
                      }}>
                  {getStatusLabel(classItem.is_active)}
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Ano */}
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Ano</p>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    {classItem.year}
                  </p>
                </div>

                {/* Capacidade */}
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Capacidade</p>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    {classItem.max_students} alunos
                  </p>
                </div>

                {/* Criado em */}
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Criado em</p>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    {classItem.created_at.toLocaleDateString()}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.tertiary }}>Status</p>
                  <p className="font-medium" style={{ color: getStatusColor(classItem.is_active) }}>
                    {getStatusLabel(classItem.is_active)}
                  </p>
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
