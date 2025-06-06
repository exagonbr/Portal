'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Student {
  id: string
  name: string
  email: string
  cpf: string
  birthDate: Date
  registrationNumber: string
  schoolId: string
  schoolName: string
  classId: string
  className: string
  grade: string
  shift: 'morning' | 'afternoon' | 'evening' | 'full'
  guardian: {
    name: string
    phone: string
    email: string
  }
  status: 'active' | 'inactive' | 'transferred' | 'graduated'
  enrollmentDate: Date
  averageGrade: number
  attendance: number
  avatar?: string
}

export default function InstitutionStudentsPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSchool, setFilterSchool] = useState<string>('all')
  const [filterClass, setFilterClass] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'transferred' | 'graduated'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      // Simular dados por enquanto
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'Ana Silva',
          email: 'ana.silva@escola.edu.br',
          cpf: '123.456.789-00',
          birthDate: new Date('2010-05-15'),
          registrationNumber: 'RA2024001',
          schoolId: '1',
          schoolName: 'Escola Municipal Dom Pedro I',
          classId: '1',
          className: 'Turma A',
          grade: '5º Ano',
          shift: 'morning',
          guardian: {
            name: 'Maria Silva',
            phone: '(11) 98765-4321',
            email: 'maria.silva@email.com'
          },
          status: 'active',
          enrollmentDate: new Date('2024-02-01'),
          averageGrade: 8.5,
          attendance: 95
        },
        {
          id: '2',
          name: 'João Santos',
          email: 'joao.santos@escola.edu.br',
          cpf: '987.654.321-00',
          birthDate: new Date('2010-08-20'),
          registrationNumber: 'RA2024002',
          schoolId: '1',
          schoolName: 'Escola Municipal Dom Pedro I',
          classId: '1',
          className: 'Turma A',
          grade: '5º Ano',
          shift: 'morning',
          guardian: {
            name: 'Pedro Santos',
            phone: '(11) 98765-1234',
            email: 'pedro.santos@email.com'
          },
          status: 'active',
          enrollmentDate: new Date('2024-02-01'),
          averageGrade: 7.8,
          attendance: 88
        },
        {
          id: '3',
          name: 'Maria Oliveira',
          email: 'maria.oliveira@escola.edu.br',
          cpf: '456.789.123-00',
          birthDate: new Date('2008-03-10'),
          registrationNumber: 'RA2024003',
          schoolId: '2',
          schoolName: 'Colégio Estadual Santos Dumont',
          classId: '3',
          className: 'Turma 3A',
          grade: '3º Ano EM',
          shift: 'morning',
          guardian: {
            name: 'Ana Oliveira',
            phone: '(11) 98765-5678',
            email: 'ana.oliveira@email.com'
          },
          status: 'active',
          enrollmentDate: new Date('2022-02-01'),
          averageGrade: 9.2,
          attendance: 98
        },
        {
          id: '4',
          name: 'Carlos Costa',
          email: 'carlos.costa@escola.edu.br',
          cpf: '789.123.456-00',
          birthDate: new Date('2009-11-25'),
          registrationNumber: 'RA2024004',
          schoolId: '1',
          schoolName: 'Escola Municipal Dom Pedro I',
          classId: '2',
          className: 'Turma B',
          grade: '5º Ano',
          shift: 'afternoon',
          guardian: {
            name: 'José Costa',
            phone: '(11) 98765-9012',
            email: 'jose.costa@email.com'
          },
          status: 'inactive',
          enrollmentDate: new Date('2024-02-01'),
          averageGrade: 6.5,
          attendance: 75
        }
      ]
      
      setStudents(mockStudents)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar alunos:', error)
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.cpf.includes(searchTerm)
    const matchesSchool = filterSchool === 'all' || student.schoolId === filterSchool
    const matchesClass = filterClass === 'all' || student.classId === filterClass
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    
    return matchesSearch && matchesSchool && matchesClass && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      active: theme.colors.status.success,
      inactive: theme.colors.status.error,
      transferred: theme.colors.status.warning,
      graduated: theme.colors.status.info
    }
    return colors[status as keyof typeof colors] || theme.colors.text.secondary
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      transferred: 'Transferido',
      graduated: 'Formado'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getShiftLabel = (shift: string) => {
    const labels = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      evening: 'Noite',
      full: 'Integral'
    }
    return labels[shift as keyof typeof labels] || shift
  }

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return theme.colors.status.success
    if (attendance >= 75) return theme.colors.status.warning
    return theme.colors.status.error
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return theme.colors.status.success
    if (grade >= 6) return theme.colors.status.warning
    return theme.colors.status.error
  }

  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const schools = Array.from(new Set(students.map(s => ({ id: s.schoolId, name: s.schoolName }))))
  const classes = Array.from(new Set(students.map(s => ({ id: s.classId, name: s.className, schoolId: s.schoolId }))))

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    avgAttendance: Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length),
    avgGrade: (students.reduce((acc, s) => acc + s.averageGrade, 0) / students.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: theme.colors.primary.DEFAULT }}></div>
      </div>
    )
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
              Gestão de Alunos
            </h1>
            <p style={{ color: theme.colors.text.secondary }}>
              Gerencie os alunos matriculados na instituição
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
            Novo Aluno
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
                group
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Total de Alunos</p>
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
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Alunos Ativos</p>
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
                event_available
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Frequência Média</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.avgAttendance}%</p>
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
                grade
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Média Geral</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.avgGrade}</p>
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
              placeholder="Buscar alunos..."
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

        {/* Filtro por Turma */}
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT,
            color: theme.colors.text.primary
          }}
        >
          <option value="all">Todas as Turmas</option>
          {classes
            .filter(c => filterSchool === 'all' || c.schoolId === filterSchool)
            .map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
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
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="transferred">Transferidos</option>
          <option value="graduated">Formados</option>
        </select>
      </motion.div>

      {/* Lista de Alunos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
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
            <div className="p-4" style={{ backgroundColor: theme.colors.background.secondary }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: theme.colors.primary.light + '30' }}>
                    <span className="material-symbols-outlined text-2xl"
                          style={{ color: theme.colors.primary.DEFAULT }}>
                      person
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                      {student.name}
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                      {student.registrationNumber}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getStatusColor(student.status) + '20',
                        color: getStatusColor(student.status)
                      }}>
                  {getStatusLabel(student.status)}
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              {/* Informações Básicas */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    school
                  </span>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {student.schoolName} - {student.className}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    schedule
                  </span>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {student.grade} - {getShiftLabel(student.shift)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    cake
                  </span>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {calculateAge(student.birthDate)} anos
                  </span>
                </div>
              </div>

              {/* Responsável */}
              <div className="p-3 rounded-lg mb-4"
                   style={{ backgroundColor: theme.colors.background.secondary }}>
                <p className="text-xs font-medium mb-1" style={{ color: theme.colors.text.tertiary }}>
                  Responsável
                </p>
                <p className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                  {student.guardian.name}
                </p>
                <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
                  {student.guardian.phone}
                </p>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: theme.colors.text.tertiary }}>Frequência</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden"
                         style={{ backgroundColor: theme.colors.border.light }}>
                      <div className="h-full rounded-full"
                           style={{
                             width: `${student.attendance}%`,
                             backgroundColor: getAttendanceColor(student.attendance)
                           }}
                      />
                    </div>
                    <span className="text-sm font-medium"
                          style={{ color: getAttendanceColor(student.attendance) }}>
                      {student.attendance}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: theme.colors.text.tertiary }}>Média</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden"
                         style={{ backgroundColor: theme.colors.border.light }}>
                      <div className="h-full rounded-full"
                           style={{
                             width: `${(student.averageGrade / 10) * 100}%`,
                             backgroundColor: getGradeColor(student.averageGrade)
                           }}
                      />
                    </div>
                    <span className="text-sm font-medium"
                          style={{ color: getGradeColor(student.averageGrade) }}>
                      {student.averageGrade.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Link
                  href={`/institution/students/${student.id}`}
                  className="flex-1 py-2 px-4 rounded-lg font-medium text-center text-sm transition-colors"
                  style={{
                    backgroundColor: theme.colors.primary.DEFAULT,
                    color: 'white'
                  }}
                >
                  Ver Perfil
                </Link>
                <button
                  className="px-3 py-2 rounded-lg transition-colors border"
                  style={{
                    borderColor: theme.colors.border.DEFAULT,
                    color: theme.colors.text.secondary
                  }}
                >
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="material-symbols-outlined text-6xl mb-4"
                style={{ color: theme.colors.text.tertiary }}>
            group
          </span>
          <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
            Nenhum aluno encontrado
          </p>
        </motion.div>
      )}
    </div>
  )
}
