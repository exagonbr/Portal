'use client'

import { useState } from 'react'
import { EDUCATION_LEVELS, EDUCATION_MODALITIES } from '../constants/education'
import type { Course } from '../types/education'

interface CourseCardProps {
  course: Course
  onEnroll?: () => void
  onViewDetails?: () => void
  isEnrolled?: boolean
}

export default function CourseCard({ 
  course, 
  onEnroll, 
  onViewDetails,
  isEnrolled = false 
}: CourseCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getLevelBadgeColor = (level: keyof typeof EDUCATION_LEVELS) => {
    const colors = {
      BASIC: 'bg-blue-100 text-blue-800',
      SUPERIOR: 'bg-purple-100 text-purple-800',
      PROFESSIONAL: 'bg-green-100 text-green-800',
      SPECIAL: 'bg-orange-100 text-orange-800'
    }
    return colors[level]
  }

  const getModalityBadgeColor = (modality: keyof typeof EDUCATION_MODALITIES) => {
    const colors = {
      SPECIAL: 'bg-orange-100 text-orange-800',
      DISTANCE: 'bg-indigo-100 text-indigo-800',
      PROFESSIONAL: 'bg-green-100 text-green-800',
      ADULT: 'bg-yellow-100 text-yellow-800',
      INDIGENOUS: 'bg-red-100 text-red-800'
    }
    return colors[modality]
  }

  const formatSchedule = (schedule: Course['schedule']) => {
    const startDate = new Date(schedule.startDate)
    const endDate = new Date(schedule.endDate)
    
    return {
      period: `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`,
      days: schedule.classDays.join(', '),
      time: schedule.classTime
    }
  }

  const schedule = formatSchedule(course.schedule)

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{course.institution.name}</p>
          </div>
          <div className="flex space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getLevelBadgeColor(course.level)
            }`}>
              {course.level}
            </span>
            {course.modality && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                getModalityBadgeColor(course.modality)
              }`}>
                {EDUCATION_MODALITIES[course.modality].name}
              </span>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Duração</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{course.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Horário</p>
            <p className="mt-1 text-sm font-medium text-gray-900">{schedule.time}</p>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center"
          >
            {showDetails ? 'Menos detalhes' : 'Mais detalhes'}
            <svg
              className={`ml-1 h-5 w-5 transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showDetails && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="mt-1 text-sm text-gray-900">{course.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Período</p>
                <p className="mt-1 text-sm text-gray-900">{schedule.period}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Dias de Aula</p>
                <p className="mt-1 text-sm text-gray-900">{schedule.days}</p>
              </div>

              {course.cycle && (
                <div>
                  <p className="text-sm text-gray-500">Ciclo</p>
                  <p className="mt-1 text-sm text-gray-900">{course.cycle}</p>
                </div>
              )}

              {course.stage && (
                <div>
                  <p className="text-sm text-gray-500">Estágio</p>
                  <p className="mt-1 text-sm text-gray-900">{course.stage}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Instituição</p>
                <div className="mt-1">
                  {course.institution.characteristics.map((characteristic, index) => (
                    <p key={index} className="text-sm text-gray-900 flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 text-gray-400"
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
                      {characteristic}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          {isEnrolled ? (
            <button
              onClick={onViewDetails}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Ver Detalhes
            </button>
          ) : (
            <>
              <button
                onClick={onEnroll}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Inscrever-se
              </button>
              <button
                onClick={onViewDetails}
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Mais Informações
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
