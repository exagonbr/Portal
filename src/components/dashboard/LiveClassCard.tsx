'use client'

import Link from 'next/link'
import { Course } from '@/types/education'

interface LiveClass {
  id: string
  courseId: string
  title: string
  date: string
  time: string
  status: 'scheduled' | 'in-progress' | 'completed'
  meetingUrl: string
  description?: string
  materials?: string[]
}

interface LiveClassCardProps {
  liveClass: LiveClass
  course?: Course
  userType: 'teacher' | 'student'
}

export default function LiveClassCard({ liveClass, course, userType }: LiveClassCardProps) {
  const getStatusColor = (status: 'scheduled' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: 'scheduled' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'scheduled':
        return 'Agendada'
      case 'in-progress':
        return 'Em Andamento'
      case 'completed':
        return 'Concluída'
      default:
        return status
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {liveClass.title}
              </h3>
              {course && (
                <p className="text-sm text-gray-500">
                  Curso: {course.name}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 flex items-center">
                <span className="material-symbols-outlined mr-2 text-[18px]">calendar_today</span>
                {liveClass.date}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <span className="material-symbols-outlined mr-2 text-[18px]">schedule</span>
                {liveClass.time}
              </p>
            </div>
            {liveClass.description && (
              <p className="text-sm text-gray-600">{liveClass.description}</p>
            )}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(liveClass.status)}`}>
              {getStatusText(liveClass.status)}
            </span>
          </div>
          <div className="flex flex-col space-y-2">
            {liveClass.status !== 'completed' && (
              <Link 
                href={liveClass.meetingUrl}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <span className="material-symbols-outlined mr-2 text-[18px]">
                  {liveClass.status === 'in-progress' ? 'video_camera_front' : 'link'}
                </span>
                {liveClass.status === 'in-progress' ? 'Entrar' : 'Acessar'}
              </Link>
            )}
            {userType === 'teacher' && (
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                <span className="material-symbols-outlined mr-2 text-[18px]">edit</span>
                Editar
              </button>
            )}
          </div>
        </div>
        {liveClass.materials && liveClass.materials.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <span className="material-symbols-outlined mr-2">folder</span>
              Materiais da Aula
            </h4>
            <div className="space-y-2">
              {liveClass.materials.map((materialId: string) => (
                <Link
                  key={materialId}
                  href={`/materials/${materialId}`}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined mr-2">description</span>
                  Material {materialId}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
