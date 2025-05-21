'use client'

import { Course } from '../types/education'

interface StudentProgressProps {
  progress: number;
  course: Course;
}

export default function StudentProgress({ progress, course }: StudentProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Progresso em {course.name}
        </h3>
        <span className="text-2xl font-bold text-blue-600">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative pt-1">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
          />
        </div>
      </div>

      {/* Course Details */}
      <div className="mt-4 grid grid-cols-2 gap-4">
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

      {/* Next Class */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Próxima Aula</h4>
        <div className="bg-gray-50 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {course.schedule.classDays[0]}
              </p>
              <p className="text-sm text-gray-500">{course.schedule.classTime}</p>
            </div>
            <button
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
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
