'use client'

import { useState } from 'react'
import { LessonPlan } from '../types/brazilianEducation'
import { BRAZILIAN_EDUCATION, CORE_SUBJECTS, EDUCATIONAL_GUIDELINES } from '../constants/brazilianEducation'

interface LessonPlanManagerProps {
  teacherId: string
  onSave: (plan: LessonPlan) => void
}

export default function LessonPlanManager({ teacherId, onSave }: LessonPlanManagerProps) {
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof BRAZILIAN_EDUCATION | ''>('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  const getGradeOptions = () => {
    if (!selectedLevel) return []
    
    switch (selectedLevel) {
      case 'INFANTIL':
        return [
          ...BRAZILIAN_EDUCATION.INFANTIL.stages.CRECHE.groups.map(g => g.name),
          ...BRAZILIAN_EDUCATION.INFANTIL.stages.PRE_ESCOLA.groups.map(g => g.name)
        ]
      case 'FUNDAMENTAL':
        return [
          ...BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles.ANOS_INICIAIS.grades.map(g => g.name),
          ...BRAZILIAN_EDUCATION.FUNDAMENTAL.cycles.ANOS_FINAIS.grades.map(g => g.name)
        ]
      case 'MEDIO':
        return BRAZILIAN_EDUCATION.MEDIO.grades.map(g => g.name)
      default:
        return []
    }
  }

  const getSubjects = () => {
    if (!selectedLevel) return []
    
    switch (selectedLevel) {
      case 'FUNDAMENTAL':
        return selectedGrade.startsWith('1') || selectedGrade.startsWith('2') || 
               selectedGrade.startsWith('3') || selectedGrade.startsWith('4') || 
               selectedGrade.startsWith('5')
          ? CORE_SUBJECTS.FUNDAMENTAL_INICIAL
          : CORE_SUBJECTS.FUNDAMENTAL_FINAL
      case 'MEDIO':
        return CORE_SUBJECTS.MEDIO
      default:
        return []
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    
    const lessonPlan: LessonPlan = {
      id: crypto.randomUUID(),
      teacherId,
      courseId: '', // This would be set when associating with a specific course
      educationalLevel: selectedLevel as keyof typeof BRAZILIAN_EDUCATION,
      grade: selectedGrade,
      subject: selectedSubject,
      unit: {
        number: parseInt(form.unitNumber.value),
        title: form.unitTitle.value,
        description: form.unitDescription.value
      },
      objectives: form.objectives.value.split('\n').filter(Boolean),
      content: {
        topics: form.topics.value.split('\n').filter(Boolean),
        activities: form.activities.value.split('\n').filter(Boolean),
        resources: form.resources.value.split('\n').filter(Boolean)
      },
      methodology: form.methodology.value.split('\n').filter(Boolean),
      evaluation: [
        {
          criteria: form.evaluationCriteria.value.split('\n').filter(Boolean),
          instruments: form.evaluationInstruments.value.split('\n').filter(Boolean),
          weight: parseInt(form.evaluationWeight.value)
        }
      ],
      schedule: {
        startDate: form.startDate.value,
        endDate: form.endDate.value,
        totalHours: parseInt(form.totalHours.value),
        weeklyHours: parseInt(form.weeklyHours.value)
      }
    }

    onSave(lessonPlan)
    form.reset()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-6">Criar Plano de Aula</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nível de Ensino</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as keyof typeof BRAZILIAN_EDUCATION)}
              required
            >
              <option value="">Selecione o nível</option>
              {Object.entries(BRAZILIAN_EDUCATION).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Série/Ano</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              required
              disabled={!selectedLevel}
            >
              <option value="">Selecione a série</option>
              {getGradeOptions().map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Disciplina</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              disabled={!selectedGrade}
            >
              <option value="">Selecione a disciplina</option>
              {getSubjects().map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Unit Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Número da Unidade</label>
            <input
              type="number"
              name="unitNumber"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              min="1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Título da Unidade</label>
            <input
              type="text"
              name="unitTitle"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição da Unidade</label>
          <textarea
            name="unitDescription"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
            required
          />
        </div>

        {/* Content Planning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Objetivos (um por linha)</label>
            <textarea
              name="objectives"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              placeholder="Digite cada objetivo em uma nova linha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tópicos (um por linha)</label>
            <textarea
              name="topics"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              placeholder="Digite cada tópico em uma nova linha"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Atividades (uma por linha)</label>
            <textarea
              name="activities"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              placeholder="Digite cada atividade em uma nova linha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Recursos (um por linha)</label>
            <textarea
              name="resources"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              placeholder="Digite cada recurso em uma nova linha"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Metodologia (uma por linha)</label>
          <textarea
            name="methodology"
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
            required
            placeholder="Digite cada método em uma nova linha"
          />
        </div>

        {/* Evaluation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Critérios de Avaliação (um por linha)</label>
            <textarea
              name="evaluationCriteria"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              placeholder="Digite cada critério em uma nova linha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Instrumentos de Avaliação (um por linha)</label>
            <textarea
              name="evaluationInstruments"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              placeholder="Digite cada instrumento em uma nova linha"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Peso da Avaliação</label>
            <input
              type="number"
              name="evaluationWeight"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
            <input
              type="date"
              name="startDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Término</label>
            <input
              type="date"
              name="endDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Horas Semanais</label>
            <input
              type="number"
              name="weeklyHours"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Total de Horas</label>
          <input
            type="number"
            name="totalHours"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
            required
            min="1"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1B365D] text-white px-4 py-2 rounded-md hover:bg-[#2A4C80] focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:ring-offset-2"
          >
            Criar Plano de Aula
          </button>
        </div>
      </form>
    </div>
  )
}
