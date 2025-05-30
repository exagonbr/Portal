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
      BASIC: 'bg-accent-blue-light/20 text-accent-blue-dark',
      SUPERIOR: 'bg-accent-purple-light/20 text-accent-purple-dark',
      PROFESSIONAL: 'bg-accent-green-light/20 text-accent-green-dark',
      SPECIAL: 'bg-accent-orange-light/20 text-accent-orange-dark'
    }
    return colors[level] || 'bg-secondary-light text-text-secondary';
  }

  const getModalityBadgeColor = (modality: keyof typeof EDUCATION_MODALITIES) => {
    const colors = {
      SPECIAL: 'bg-accent-orange-light/20 text-accent-orange-dark',
      DISTANCE: 'bg-secondary-light text-text-secondary',
      PROFESSIONAL: 'bg-accent-green-light/20 text-accent-green-dark',
      ADULT: 'bg-primary-light/20 text-primary-dark',
      INDIGENOUS: 'bg-error-light/20 text-error-dark'
    }
    return colors[modality] || 'bg-secondary-light text-text-secondary';
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
      className="card hover:translate-y-[-4px] transition-all duration-300 bg-background-primary shadow-md hover:shadow-lg rounded-lg overflow-hidden border border-border-light"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-labelledby={`course-title-${course.id}`}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3
              id={`course-title-${course.id}`}
              className="text-xl font-semibold text-primary-dark group-hover:text-primary-DEFAULT transition-colors duration-300"
            >
              {course.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {course.institution.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`badge px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(course.level)}`}>
              {EDUCATION_LEVELS[course.level]}
            </span>
            {course.modality && (
              <span className={`badge px-2.5 py-0.5 rounded-full text-xs font-medium ${getModalityBadgeColor(course.modality)}`}>
                {EDUCATION_MODALITIES[course.modality].name}
              </span>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Duração</p>
              <p className="text-sm font-medium text-text-primary">{course.duration}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-light/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Horário</p>
              <p className="text-sm font-medium text-text-primary">{schedule.time}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="relative">
          <p className={`text-sm text-text-secondary transition-all duration-500 ${
            showDetails ? '' : 'line-clamp-2'
          }`}>
            {course.description}
          </p>
          {!showDetails && (
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background-primary to-transparent" />
          )}
        </div>

        {/* Expandable Details */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-DEFAULT hover:text-primary-dark font-medium flex items-center space-x-1 transition-colors duration-300"
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
              <div className="p-3 rounded-lg bg-background-secondary">
                <p className="text-sm text-text-secondary">Período</p>
                <p className="text-sm font-medium text-text-primary">{schedule.period}</p>
              </div>
              <div className="p-3 rounded-lg bg-background-secondary">
                <p className="text-sm text-text-secondary">Dias de Aula</p>
                <p className="text-sm font-medium text-text-primary">{schedule.days}</p>
              </div>
            </div>

            {course.cycle && (
              <div className="p-3 rounded-lg bg-background-secondary">
                <p className="text-sm text-text-secondary">Ciclo</p>
                <p className="text-sm font-medium text-text-primary">{course.cycle}</p>
              </div>
            )}

            {course.stage && (
              <div className="p-3 rounded-lg bg-background-secondary">
                <p className="text-sm text-text-secondary">Estágio</p>
                <p className="text-sm font-medium text-text-primary">{course.stage}</p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-background-tertiary">
              <h4 className="text-sm font-medium text-text-primary mb-3">Informações da Instituição</h4>
              <ul className="space-y-2">
                {course.institution.characteristics.map((characteristic, index) => (
                  <li
                    key={index}
                    className="text-sm text-text-secondary flex items-start space-x-2"
                  >
                    <svg
                      className="h-5 w-5 text-success-DEFAULT flex-shrink-0"
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

        {/* Actions */}
        <div className="flex gap-3">
          {isEnrolled ? (
            <button
              onClick={onViewDetails}
              className="bg-primary-DEFAULT hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full flex items-center justify-center group"
              aria-label={`Ver detalhes do curso ${course.name}`}
            >
              <span>Ver Detalhes</span>
              <svg
                className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <>
              <button
                onClick={onEnroll}
                className="bg-primary-DEFAULT hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center group"
                aria-label={`Inscrever-se no curso ${course.name}`}
              >
                <span>Inscrever-se</span>
                <svg
                  className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                onClick={onViewDetails}
                className="border border-primary-DEFAULT text-primary-DEFAULT hover:bg-primary-light/20 px-4 py-2 rounded-lg transition-colors duration-200 flex-1 flex items-center justify-center group"
                aria-label={`Mais informações sobre o curso ${course.name}`}
              >
                <span>Mais Informações</span>
                <svg
                  className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
