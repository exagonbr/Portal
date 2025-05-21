'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EDUCATION_LEVELS, EDUCATION_MODALITIES } from '@/constants/education'
import type { Course } from '@/types/education'

// Mock data - In a real app, this would come from an API
const MOCK_COURSE: Course = {
  id: '1',
  name: 'Matemática Fundamental',
  description: 'Fundamentos de matemática para o ensino fundamental, abordando conceitos essenciais como operações básicas, frações, geometria e resolução de problemas. O curso é estruturado para desenvolver o raciocínio lógico e preparar os alunos para desafios matemáticos mais avançados.',
  level: 'BASIC',
  cycle: 'Anos Iniciais',
  stage: '5º ano',
  institution: {
    id: '1',
    name: 'Escola Municipal São José',
    type: 'UNIVERSITY',
    characteristics: [
      'Ensino fundamental completo',
      'Laboratório de matemática',
      'Professores especializados',
      'Material didático próprio',
      'Acompanhamento individualizado'
    ]
  },
  duration: '1 ano letivo',
  schedule: {
    startDate: '2024-02-01',
    endDate: '2024-12-15',
    classDays: ['Segunda', 'Quarta', 'Sexta'],
    classTime: '07:30 - 11:30'
  }
}

interface EnrollmentFormData {
  name: string
  email: string
  phone: string
  birthDate: string
  specialNeeds: boolean
  specialNeedsDescription?: string
  documents: {
    rg: boolean
    cpf: boolean
    address: boolean
    photo: boolean
    schoolRecords: boolean
  }
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EnrollmentFormData>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    specialNeeds: false,
    documents: {
      rg: false,
      cpf: false,
      address: false,
      photo: false,
      schoolRecords: false
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      if (name.startsWith('documents.')) {
        const documentName = name.split('.')[1]
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [documentName]: checked
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit to an API
    alert('Inscrição realizada com sucesso!')
    router.push('/dashboard')
  }

  const getLevelBadgeColor = (level: keyof typeof EDUCATION_LEVELS) => {
    const colors = {
      BASIC: 'bg-blue-100 text-blue-800',
      SUPERIOR: 'bg-purple-100 text-purple-800',
      PROFESSIONAL: 'bg-green-100 text-green-800',
      SPECIAL: 'bg-orange-100 text-orange-800'
    }
    return colors[level]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{MOCK_COURSE.name}</h1>
                <p className="mt-2 text-sm text-gray-500">{MOCK_COURSE.institution.name}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                getLevelBadgeColor(MOCK_COURSE.level)
              }`}>
                {MOCK_COURSE.level}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duração</h3>
                <p className="mt-1 text-lg text-gray-900">{MOCK_COURSE.duration}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Horário</h3>
                <p className="mt-1 text-lg text-gray-900">{MOCK_COURSE.schedule.classTime}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dias de Aula</h3>
                <p className="mt-1 text-lg text-gray-900">{MOCK_COURSE.schedule.classDays.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900">Descrição do Curso</h2>
              <p className="mt-4 text-gray-600">{MOCK_COURSE.description}</p>
            </div>

            {/* Schedule */}
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900">Cronograma</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Início das Aulas</h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(MOCK_COURSE.schedule.startDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Término das Aulas</h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(MOCK_COURSE.schedule.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Institution Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900">Instituição</h2>
              <div className="mt-4 space-y-4">
                {MOCK_COURSE.institution.characteristics.map((characteristic, index) => (
                  <div key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600">{characteristic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrollment CTA */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900">Inscrição</h2>
              <p className="mt-2 text-sm text-gray-500">
                Vagas limitadas. Garanta já sua vaga neste curso.
              </p>
              <button
                onClick={() => setIsEnrollmentOpen(true)}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Inscrever-se
              </button>
            </div>
          </div>
        </div>

        {/* Enrollment Modal */}
        {isEnrollmentOpen && (
          <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    onClick={() => setIsEnrollmentOpen(false)}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Formulário de Inscrição - {currentStep}/2
                    </h3>

                    <form onSubmit={handleSubmit} className="mt-6">
                      {currentStep === 1 ? (
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Nome Completo
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              E-mail
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Telefone
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                              Data de Nascimento
                            </label>
                            <input
                              type="date"
                              name="birthDate"
                              id="birthDate"
                              required
                              value={formData.birthDate}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  name="specialNeeds"
                                  id="specialNeeds"
                                  checked={formData.specialNeeds}
                                  onChange={handleInputChange}
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="specialNeeds" className="font-medium text-gray-700">
                                  Necessidades Especiais
                                </label>
                              </div>
                            </div>
                          </div>

                          {formData.specialNeeds && (
                            <div>
                              <label htmlFor="specialNeedsDescription" className="block text-sm font-medium text-gray-700">
                                Descreva suas necessidades especiais
                              </label>
                              <textarea
                                name="specialNeedsDescription"
                                id="specialNeedsDescription"
                                required
                                value={formData.specialNeedsDescription}
                                onChange={(e) => setFormData(prev => ({ ...prev, specialNeedsDescription: e.target.value }))}
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Documentos Necessários</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              Marque os documentos que você já possui em mãos
                            </p>
                            <div className="mt-4 space-y-4">
                              {Object.entries({
                                rg: 'RG ou CNH',
                                cpf: 'CPF',
                                address: 'Comprovante de Residência',
                                photo: 'Foto 3x4',
                                schoolRecords: 'Histórico Escolar'
                              }).map(([key, label]) => (
                                <div key={key} className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      type="checkbox"
                                      name={`documents.${key}`}
                                      id={`documents.${key}`}
                                      checked={formData.documents[key as keyof typeof formData.documents]}
                                      onChange={handleInputChange}
                                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor={`documents.${key}`} className="font-medium text-gray-700">
                                      {label}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-8 flex justify-end space-x-3">
                        {currentStep === 1 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Próximo
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setCurrentStep(1)}
                              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Voltar
                            </button>
                            <button
                              type="submit"
                              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Finalizar Inscrição
                            </button>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
