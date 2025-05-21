'use client'

import { useState } from 'react'
import { Course } from '../types/education'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  xpReward: number
}

interface Milestone {
  id: string
  title: string
  description: string
  target: number
  current: number
  reward: number
  type: 'xp' | 'completion' | 'streak'
}

interface StudentProgressProps {
  progress: number
  course: Course
  totalXP?: number
  achievements?: Achievement[]
  milestones?: Milestone[]
  streak?: number
}

export default function StudentProgress({ 
  progress, 
  course,
  totalXP = 0,
  achievements = [],
  milestones = [],
  streak = 0
}: StudentProgressProps) {
  const [showAchievements, setShowAchievements] = useState(false)

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-error-color'
    if (progress < 70) return 'bg-warning-color'
    return 'bg-success-color'
  }

  const formatStreak = (days: number) => {
    if (days === 0) return 'Comece sua jornada hoje!'
    if (days === 1) return '1 dia de estudo'
    return `${days} dias de estudo consecutivos`
  }

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {course.name}
            </h3>
            <p className="text-sm text-gray-500">Seu progresso atual</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary-color">
              {progress}%
            </span>
            <p className="text-sm text-gray-500">Completo</p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
            <div
              style={{ width: `${progress}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out ${getProgressColor(progress)}`}
            />
          </div>
        </div>

        {/* XP and Streak Section */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-primary-color/5 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-warning-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-lg font-bold text-warning-color">{totalXP} XP</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Total acumulado</p>
          </div>
          <div className="bg-primary-color/5 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-success-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-lg font-bold text-success-color">{streak}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{formatStreak(streak)}</p>
          </div>
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-gray-500">Ciclo</p>
            <p className="text-sm font-medium text-gray-900">{course.cycle}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estágio</p>
            <p className="text-sm font-medium text-gray-900">{course.stage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duração</p>
            <p className="text-sm font-medium text-gray-900">{course.duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Horário</p>
            <p className="text-sm font-medium text-gray-900">{course.schedule.classTime}</p>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => setShowAchievements(!showAchievements)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-300"
        >
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-warning-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-lg font-semibold text-gray-900">Conquistas</span>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${
              showAchievements ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className={`transition-all duration-500 ${
          showAchievements ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="p-6 grid gap-4">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`flex items-center space-x-4 p-4 rounded-lg ${
                  achievement.unlockedAt 
                    ? 'bg-success-color/5 border border-success-color/20' 
                    : 'bg-gray-100'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.unlockedAt ? 'bg-success-color/20' : 'bg-gray-200'
                }`}>
                  <span className="text-2xl" role="img" aria-label={achievement.title}>
                    {achievement.icon}
                  </span>
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-500">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-success-color mt-1">
                      Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-sm font-medium text-warning-color">+{achievement.xpReward} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Objetivos</h3>
        <div className="space-y-4">
          {milestones.map(milestone => {
            const progress = (milestone.current / milestone.target) * 100
            return (
              <div key={milestone.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                    <p className="text-xs text-gray-500">{milestone.description}</p>
                  </div>
                  <span className="text-sm font-medium text-warning-color">+{milestone.reward} XP</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-primary-color">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary-color">
                        {milestone.current}/{milestone.target}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                    <div
                      style={{ width: `${progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-color transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Class Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Próxima Aula</h3>
        <div className="bg-primary-color/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {course.schedule.classDays[0]}
              </p>
              <p className="text-sm text-gray-500">{course.schedule.classTime}</p>
            </div>
            <button
              className="px-4 py-2 text-sm font-medium text-primary-color hover:text-primary-light transition-colors duration-300"
              onClick={() => {}}
            >
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
