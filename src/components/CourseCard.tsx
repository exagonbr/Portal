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
  const [isHovered, setIsHovered] = useState(false)

  const getLevelBadgeColor = (level: keyof typeof EDUCATION_LEVELS) => {
    const colors = {
      BASIC: 'bg-accent-color/10 text-accent-color border border-accent-color/20',
      SUPERIOR: 'bg-purple-100 text-purple-800 border border-purple-200',
      PROFESSIONAL: 'bg-success-color/10 text-success-color border border-success-color/20',
      SPECIAL: 'bg-warning-color/10 text-warning-color border border-warning-color/20'
    }
    return colors[level]
  }

  const getModalityBadgeColor = (modality: keyof typeof EDUCATION_MODALITIES) => {
    const colors = {
      SPECIAL: 'bg-warning-color/10 text-warning-color border border-warning-color/20',
      DISTANCE: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      PROFESSIONAL: 'bg-success-color/10 text-success-color border border-success-color/20',
      ADULT: 'bg-secondary-color/10 text-secondary-color border border-secondary-color/20',
      INDIGENOUS: 'bg-error-color/10 text-error-color border border-error-color/20'
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
    <div 
      className="course-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`course-title-${course.id}`}
    >
      <div className="p-6 space-y-6">
        {/* Header with hover effect */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 
              id={`course-title-${course.id}`}
              className="text-xl font-semibold text-gray-900 group-hover:text-primary-color transition-colors duration-300"
            >
              {course.name}
            </h3>
            <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
              {course.institution.name}
            </p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${getLevelBadgeColor(course.level)}`}>
              {EDUCATION_LEVELS[course.level]}
            </span>
            {course.modality && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${getModalityBadgeColor(course.modality)}`}>
                {EDUCATION_MODALITIES[course.modality].name}
              </span>
            )}
          </div>
        </div>

        {/* Basic Info with Icons */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-primary-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Duração</p>
              <p className="text-sm font-medium text-gray-900">{course.duration}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-primary-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Horário</p>
              <p className="text-sm font-medium text-gray-900">{schedule.time}</p>
            </div>
          </div>
        </div>

        {/* Description Preview with gradient fade */}
        <div className="relative">
          <p className={`text-sm text-gray-600 transition-all duration-500 ${
            showDetails ? '' : 'line-clamp-2'
          }`}>
            {course.description}
          </p>
          {!showDetails && (
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>

        {/* Expandable Details with smooth transition */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-color hover:text-primary-light font-medium flex items-center space-x-1 transition-colors duration-300"
            aria-expanded={showDetails}
          >
            <span>{showDetails ? 'Menos detalhes' : 'Mais detalhes'}</span>
            <svg
              className={`h-5 w-5 transform transition-transform duration-300 ${
                showDetails ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`mt-4 space-y-4 transition-all duration-500 ${
            showDetails ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Período</p>
                <p className="text-sm text-gray-900">{schedule.period}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dias de Aula</p>
                <p className="text-sm text-gray-900">{schedule.days}</p>
              </div>
            </div>

            {course.cycle && (
              <div>
                <p className="text-sm text-gray-500">Ciclo</p>
                <p className="text-sm text-gray-900">{course.cycle}</p>
              </div>
            )}

            {course.stage && (
              <div>
                <p className="text-sm text-gray-500">Estágio</p>
                <p className="text-sm text-gray-900">{course.stage}</p>
              </div>
            )}

            <div className="institution-info">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Informações da Instituição</h4>
              <ul className="space-y-2">
                {course.institution.characteristics.map((characteristic, index) => (
                  <li 
                    key={index} 
                    className="text-sm text-gray-600 flex items-start space-x-2"
                  >
                    <svg
                      className="h-5 w-5 text-success-color flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{characteristic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions with enhanced hover effects */}
        <div className="flex gap-3">
          {isEnrolled ? (
            <button
              onClick={onViewDetails}
              className="flex-1 btn-primary group"
              aria-label={`Ver detalhes do curso ${course.name}`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Ver Detalhes</span>
                <svg 
                  className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ) : (
            <>
              <button
                onClick={onEnroll}
                className="flex-1 btn-primary group"
                aria-label={`Inscrever-se no curso ${course.name}`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Inscrever-se</span>
                  <svg 
                    className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              <button
                onClick={onViewDetails}
                className="flex-1 btn-secondary group"
                aria-label={`Mais informações sobre o curso ${course.name}`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Mais Informações</span>
                  <svg 
                    className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
