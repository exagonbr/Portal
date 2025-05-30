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

  const getProgressColor = (currentProgress: number) => {
    if (currentProgress < 30) return 'bg-error-DEFAULT'
    if (currentProgress < 70) return 'bg-warning-DEFAULT'
    return 'bg-success-DEFAULT'
  }

  const formatStreak = (days: number) => {
    if (days === 0) return 'Comece sua jornada hoje!'
    if (days === 1) return '1 dia de estudo'
    return `${days} dias de estudo consecutivos`
  }

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <div className="bg-background-primary rounded-lg shadow-md p-6 border border-border-light">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {course.name}
            </h3>
            <p className="text-sm text-text-secondary">Seu progresso atual</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary-DEFAULT">
              {progress}%
            </span>
            <p className="text-sm text-text-secondary">Completo</p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-secondary-light">
            <div
              style={{ width: `${progress}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out ${getProgressColor(progress)}`}
            />
          </div>
        </div>

        {/* XP and Streak Section */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-accent-yellow-light/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-accent-yellow-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-lg font-bold text-accent-yellow-dark">{totalXP} XP</span>
            </div>
            <p className="text-sm text-text-secondary mt-1">Total acumulado</p>
          </div>
          <div className="bg-success-light/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-success-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-lg font-bold text-success-dark">{streak}</span>
            </div>
            <p className="text-sm text-text-secondary mt-1">{formatStreak(streak)}</p>
          </div>
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-sm text-text-secondary">Ciclo</p>
            <p className="text-sm font-medium text-text-primary">{course.cycle}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Estágio</p>
            <p className="text-sm font-medium text-text-primary">{course.stage}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Duração</p>
            <p className="text-sm font-medium text-text-primary">{course.duration}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Horário</p>
            <p className="text-sm font-medium text-text-primary">{course.schedule.classTime}</p>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-background-primary rounded-lg shadow-md overflow-hidden border border-border-light">
        <button
          onClick={() => setShowAchievements(!showAchievements)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-background-secondary transition-colors duration-300"
        >
          <div className="flex items-center space-x-2">
            <svg className="h-6 w-6 text-accent-yellow-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-lg font-semibold text-text-primary">Conquistas</span>
          </div>
          <svg
            className={`h-5 w-5 text-text-tertiary transform transition-transform duration-300 ${
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
                    ? 'bg-success-light/10 border border-success-light/30'
                    : 'bg-background-secondary border border-border-light'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.unlockedAt ? 'bg-success-light/20' : 'bg-secondary-light'
                }`}>
                  <span className="text-2xl" role="img" aria-label={achievement.title}>
                    {achievement.icon}
                  </span>
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-medium text-text-primary">{achievement.title}</h4>
                  <p className="text-sm text-text-secondary">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-success-dark mt-1">
                      Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-sm font-medium text-accent-yellow-dark">+{achievement.xpReward} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-background-primary rounded-lg shadow-md p-6 border border-border-light">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Objetivos</h3>
        <div className="space-y-4">
          {milestones.map(milestone => {
            const currentProgress = milestone.target > 0 ? (milestone.current / milestone.target) * 100 : 0;
            return (
              <div key={milestone.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">{milestone.title}</h4>
                    <p className="text-xs text-text-secondary">{milestone.description}</p>
                  </div>
                  <span className="text-sm font-medium text-accent-yellow-dark">+{milestone.reward} XP</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-primary-dark">
                        {Math.round(currentProgress)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary-dark">
                        {milestone.current}/{milestone.target}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-secondary-light">
                    <div
                      style={{ width: `${currentProgress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-DEFAULT transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Class Preview */}
      <div className="bg-background-primary rounded-lg shadow-md p-6 border border-border-light">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Próxima Aula</h3>
        <div className="bg-primary-light/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {course.schedule.classDays[0]}
              </p>
              <p className="text-sm text-text-secondary">{course.schedule.classTime}</p>
            </div>
            <button
              className="px-4 py-2 text-sm font-medium text-primary-DEFAULT hover:text-primary-dark transition-colors duration-300"
              onClick={() => {}} // Placeholder for navigation or action
            >
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
