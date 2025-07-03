'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Teacher {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
  schoolId: string
  schoolName: string
  subjects: string[]
  classes: {
    id: string
    name: string
    grade: string
  }[]
  qualifications: {
    degree: string
    institution: string
    year: number
  }[]
  experience: number // anos
  status: 'active' | 'inactive' | 'vacation'
  joinDate: Date
  avatar?: string
}

export default function InstitutionTeachersPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSchool, setFilterSchool] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'vacation'>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      // Simular dados por enquanto
      const mockTeachers: Teacher[] = [
        {
          id: '1',
          name: 'Prof. Maria Silva',
          email: 'maria.silva@escola.edu.br',
          cpf: '123.456.789-00',
          phone: '(11) 98765-4321',
          schoolId: '1',
          schoolName: 'Escola Municipal Dom Pedro I',
          subjects: ['Matemática', 'Física'],
          classes: [
            { id: '1', name: 'Turma A', grade: '5º Ano' },
            { id: '2', name: 'Turma B', grade: '5º Ano' }
          ],
          qualifications: [
            { degree: 'Licenciatura em Matemática', institution: 'USP', year: 2010 },
            { degree: 'Mestrado em Educação', institution: 'UNICAMP', year: 2015 }
          ],
          experience: 12,
          status: 'active',
          joinDate: new Date('2012-02-15')
        },
        {
          id: '2',
          name: 'Prof. João Santos',
          email: 'joao.santos@escola.edu.br',
          cpf: '987.654.321-00',
          phone: '(11) 98765-1234',
          schoolId: '1',
          schoolName: 'Escola Municipal Dom Pedro I',
          subjects: ['Português', 'Literatura'],
          classes: [
            { id: '3', name: 'Turma C', grade: '6º Ano' }
          ],
          qualifications: [
            { degree: 'Licenciatura em Letras', institution: 'PUC-SP', year: 2008 }
          ],
          experience: 15,
          status: 'active',
          joinDate: new Date('2009-03-20')
        },
        {
          id: '3',
          name: 'Prof. Ana Costa',
          email: 'ana.costa@escola.edu.br',
          cpf: '456.789.123-00',
          phone: '(11) 98765-5678',
          schoolId: '2',
          schoolName: 'Colégio Estadual Santos Dumont',
          subjects: ['Química', 'Biologia'],
          classes: [
            { id: '4', name: 'Turma 3A', grade: '3º Ano EM' },
            { id: '5', name: 'Turma 3B', grade: '3º Ano EM' }
          ],
          qualifications: [
            { degree: 'Licenciatura em Química', institution: 'UNESP', year: 2012 },
            { degree: 'Especialização em Ensino de Ciências', institution: 'UFABC', year: 2018 }
          ],
          experience: 10,
          status: 'vacation',
          joinDate: new Date('2014-01-10')
        },
        {
          id: '4',
          name: 'Prof. Carlos Oliveira',
          email: 'carlos.oliveira@escola.edu.br',
          cpf: '789.123.456-00',
          phone: '(11) 98765-9012',
          schoolId: '3',
          schoolName: 'Instituto Técnico Industrial',
          subjects: ['Programação', 'Banco de Dados', 'Redes'],
          classes: [
            { id: '6', name: 'Turma TI-2', grade: '2º Módulo' }
          ],
          qualifications: [
            { degree: 'Bacharelado em Ciência da Computação', institution: 'UNIFESP', year: 2005 },
            { degree: 'MBA em Gestão de TI', institution: 'FGV', year: 2010 }
          ],
          experience: 18,
          status: 'active',
          joinDate: new Date('2006-08-01')
        }
      ]
      
      setTeachers(mockTeachers)
      setLoading(false)
    } catch (error) {
      console.log('Erro ao buscar professores:', error)
      setLoading(false)
    }
  }

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.cpf.includes(searchTerm)
    const matchesSchool = filterSchool === 'all' || teacher.schoolId === filterSchool
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus
    const matchesSubject = filterSubject === 'all' || teacher.subjects.includes(filterSubject)
    
    return matchesSearch && matchesSchool && matchesStatus && matchesSubject
  })

  const getStatusColor = (status: string) => {
    const colors = {
      active: theme.colors.status.success,
      inactive: theme.colors.status.error,
      vacation: theme.colors.status.warning
    }
    return colors[status as keyof typeof colors] || theme.colors.text.secondary
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      vacation: 'Férias'
    }
    return labels[status as keyof typeof labels] || status
  }

  const schools = Array.from(new Set(teachers.map(t => ({ id: t.schoolId, name: t.schoolName }))))
  const allSubjects = Array.from(new Set(teachers.flatMap(t => t.subjects))).sort()

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    totalClasses: teachers.reduce((acc, t) => acc + t.classes.length, 0),
    avgExperience: Math.round(teachers.reduce((acc, t) => acc + t.experience, 0) / teachers.length)
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
              Gestão de Professores
            </h1>
            <p style={{ color: theme.colors.text.secondary }}>
              Gerencie o corpo docente da instituição
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
            Novo Professor
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
                groups
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Total de Professores</p>
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
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Professores Ativos</p>
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
                class
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Total de Turmas</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.totalClasses}</p>
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
                work_history
              </span>
            </div>
            <div>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>Média de Experiência</p>
              <p className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>{stats.avgExperience} anos</p>
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
              placeholder="Buscar professores..."
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

        {/* Filtro por Disciplina */}
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT,
            color: theme.colors.text.primary
          }}
        >
          <option value="all">Todas as Disciplinas</option>
          {allSubjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
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
          <option value="vacation">Férias</option>
        </select>
      </motion.div>

      {/* Lista de Professores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher, index) => (
          <motion.div
            key={teacher.id}
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
                      {teacher.name}
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                      {teacher.schoolName}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getStatusColor(teacher.status) + '20',
                        color: getStatusColor(teacher.status)
                      }}>
                  {getStatusLabel(teacher.status)}
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              {/* Contato */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    email
                  </span>
                  <span style={{ color: theme.colors.text.secondary }}>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    phone
                  </span>
                  <span style={{ color: theme.colors.text.secondary }}>{teacher.phone}</span>
                </div>
              </div>

              {/* Disciplinas */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                  Disciplinas
                </p>
                <div className="flex flex-wrap gap-1">
                  {teacher.subjects.map((subject, idx) => (
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

              {/* Informações */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p style={{ color: theme.colors.text.tertiary }}>Turmas</p>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    {teacher.classes.length} turma(s)
                  </p>
                </div>
                <div>
                  <p style={{ color: theme.colors.text.tertiary }}>Experiência</p>
                  <p className="font-medium" style={{ color: theme.colors.text.primary }}>
                    {teacher.experience} anos
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Link
                  href={`/institution/teachers/${teacher.id}`}
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
      {filteredTeachers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="material-symbols-outlined text-6xl mb-4"
                style={{ color: theme.colors.text.tertiary }}>
            groups
          </span>
          <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
            Nenhum professor encontrado
          </p>
        </motion.div>
      )}
    </div>
  )
}
