'use client'

import { Course } from '@/types/education'

interface CourseCardProps {
  course: Course
  userType: 'teacher' | 'student'
}

export default function CourseCard({ course, userType }: CourseCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="h-40 bg-gradient-to-br from-blue-600 to-blue-700 rounded-t-xl flex items-center justify-center relative overflow-hidden">
        <span className="text-white/20 text-6xl font-bold absolute">
          {course.name[0]}
        </span>
        <div className="relative z-10 text-white text-center p-4">
          <h3 className="text-xl font-semibold mb-1">
            {course.name}
          </h3>
          <p className="text-sm text-white/80">
            {course.cycle || course.level}
          </p>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4">{course.description}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="w-20 text-gray-500">Nível:</span>
            <span className="text-gray-900">{course.level}</span>
          </div>
          {course.cycle && (
            <div className="flex items-center text-sm">
              <span className="w-20 text-gray-500">Ciclo:</span>
              <span className="text-gray-900">{course.cycle}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <span className="w-20 text-gray-500">Duração:</span>
            <span className="text-gray-900">{course.duration}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="w-20 text-gray-500">Horário:</span>
            <span className="text-gray-900">{course.schedule.classTime}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined mr-2 text-[20px]">
              {userType === 'teacher' ? 'edit' : 'play_arrow'}
            </span>
            {userType === 'teacher' ? 'Gerenciar' : 'Acessar'}
          </button>
        </div>
      </div>
    </div>
  )
}
