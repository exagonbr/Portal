'use client'

import { useState } from 'react'
import { ClassGroup } from '../types/brazilianEducation'
import { BRAZILIAN_EDUCATION } from '../constants/brazilianEducation'

interface ClassGroupManagerProps {
  teacherId: string
  onSave: (classGroup: ClassGroup) => void
}

export default function ClassGroupManager({ teacherId, onSave }: ClassGroupManagerProps) {
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof BRAZILIAN_EDUCATION | ''>('')
  const [selectedGrade, setSelectedGrade] = useState('')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    const classGroup: ClassGroup = {
      id: crypto.randomUUID(),
      name: formData.get('className') as string,
      educationalLevel: selectedLevel as keyof typeof BRAZILIAN_EDUCATION,
      grade: selectedGrade,
      academicYear: formData.get('academicYear') as string,
      shift: formData.get('shift') as 'morning' | 'afternoon' | 'evening',
      teachers: [{
        teacherId,
        subjects: (formData.get('subjects') as string).split(',').map((s: string) => s.trim())
      }],
      students: [], // Will be populated when students are enrolled
      schedule: [
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta'
      ].map(day => ({
        dayOfWeek: day,
        subjects: []  // Will be populated with the class schedule
      })),
      capacity: {
        total: parseInt(formData.get('capacity') as string),
        enrolled: 0
      }
    }

    onSave(classGroup)
    form.reset()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-6">Criar Nova Turma</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome da Turma</label>
            <input
              type="text"
              name="className"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Ano Letivo</label>
            <input
              type="text"
              name="academicYear"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              placeholder="2024"
            />
          </div>
        </div>

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
            <label className="block text-sm font-medium text-gray-700">Turno</label>
            <select
              name="shift"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
            >
              <option value="morning">Manhã</option>
              <option value="afternoon">Tarde</option>
              <option value="evening">Noite</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Disciplinas (separadas por vírgula)</label>
            <input
              type="text"
              name="subjects"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              placeholder="Matemática, Português, História"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacidade Total</label>
            <input
              type="number"
              name="capacity"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
              required
              min="1"
              max="50"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#1B365D] text-white px-4 py-2 rounded-md hover:bg-[#2A4C80] focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:ring-offset-2"
          >
            Criar Turma
          </button>
        </div>
      </form>
    </div>
  )
}
