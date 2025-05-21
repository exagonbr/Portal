'use client'

import { useState } from 'react'
import { 
  calculateAge, 
  isEligibleForEJA, 
  isEligibleForModality,
  validateEducationalProgress,
  getNextEducationalStage
} from '../utils/educationHelpers'
import { EDUCATION_MODALITIES } from '../constants/education'
import type { Student, Course, EducationalProgress } from '../types/education'

interface StudentProgressProps {
  student: Student
  course: Course
  progress: EducationalProgress
}

export default function StudentProgress({ student, course, progress }: StudentProgressProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'next-steps'>('overview')

  const age = calculateAge(new Date(student.birthDate))
  const { isValid, messages } = validateEducationalProgress(progress, course)
  const nextStage = getNextEducationalStage(
    { id: student.currentStage, name: student.currentStage },
    student.specialNeeds
  )

  const eligibleModalities = Object.entries(EDUCATION_MODALITIES).filter(
    ([key]) => isEligibleForModality(student, key as keyof typeof EDUCATION_MODALITIES)
  )

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Enhanced Header with Enterprise Features */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900" id="student-progress-title">
              Progresso do Aluno
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {student.name} • {age} anos • {student.currentStage}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
              role="status"
            >
              {isValid ? 'Regular' : 'Atenção Necessária'}
            </span>
            {student.specialNeeds && (
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                role="status"
              >
                Adaptações Especiais
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" role="tablist" aria-label="Progresso do estudante">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'details', label: 'Detalhes' },
            { id: 'next-steps', label: 'Próximos Passos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Enhanced Content with ARIA roles */}
      <div className="px-6 py-4" aria-labelledby="student-progress-title">
        {activeTab === 'overview' && (
          <div 
            className="space-y-6"
            role="tabpanel"
            id="overview-panel"
            aria-labelledby="overview-tab"
          >
            {/* Enhanced Progress Bar */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700" id="progress-label">
                  Progresso Geral
                </span>
                <span 
                  className="text-sm font-medium text-gray-900"
                  aria-labelledby="progress-label"
                >
                  {progress.progress}%
                </span>
              </div>
              <div 
                className="mt-2 relative"
                role="progressbar"
                aria-valuenow={progress.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${progress.progress}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                      progress.progress >= 75 ? 'bg-green-500' : 
                      progress.progress >= 50 ? 'bg-blue-500' : 
                      'bg-yellow-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div>
              <h3 className="text-sm font-medium text-gray-700">Frequência</h3>
              <dl className="mt-2 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <dt className="text-xs text-gray-500">Presença</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {((progress.attendance.present / progress.attendance.total) * 100).toFixed(1)}%
                  </dd>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <dt className="text-xs text-gray-500">Faltas Justificadas</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {progress.attendance.justified}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Grades */}
            <div>
              <h3 className="text-sm font-medium text-gray-700">Notas</h3>
              <dl className="mt-2 grid grid-cols-2 gap-4">
                {Object.entries(progress.grades).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <dt className="text-xs text-gray-500 capitalize">{key}</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">{value.toFixed(1)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Status Messages */}
            {messages.length > 0 && (
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Pontos de Atenção</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {messages.map((message, index) => (
                          <li key={index}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Eligible Modalities */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Modalidades Elegíveis</h3>
              <div className="grid grid-cols-2 gap-4">
                {eligibleModalities.map(([key, modality]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">{modality.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">{modality.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Accommodations */}
            {student.specialNeeds && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Adaptações Especiais</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">
                    {student.specialNeeds.category}
                  </h4>
                  <p className="mt-1 text-sm text-blue-700">
                    {student.specialNeeds.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'next-steps' && (
          <div className="space-y-6">
            {/* Next Stage */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Próxima Etapa</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{nextStage.nextStage.name}</h4>
                {nextStage.nextStage.description && (
                  <p className="mt-1 text-sm text-gray-500">{nextStage.nextStage.description}</p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Requisitos</h3>
              <ul className="space-y-3">
                {nextStage.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-gray-400 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="ml-2 text-sm text-gray-500">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Special Accommodations for Next Stage */}
            {nextStage.accommodations && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Adaptações Necessárias
                </h3>
                <ul className="space-y-3">
                  {nextStage.accommodations.map((accommodation, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-blue-400 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="ml-2 text-sm text-gray-500">{accommodation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
