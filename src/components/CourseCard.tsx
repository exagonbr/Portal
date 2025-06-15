'use client'

import { CourseResponseDto } from '@/types/api'
import { BookOpen, Users, Clock, ExternalLink, Edit } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface CourseCardProps {
  course: CourseResponseDto
  userType: 'teacher' | 'student'
  onAccess: () => void
  onManage: () => void
}

export default function CourseCard({ course, userType, onAccess, onManage }: CourseCardProps) {
  // Funções para obter cores baseadas no nível e tipo do curso
  const getLevelColor = () => {
    switch (course.level) {
      case 'FUNDAMENTAL': return 'bg-green-100 text-green-800'
      case 'MEDIO': return 'bg-blue-100 text-blue-800'
      case 'SUPERIOR': return 'bg-purple-100 text-purple-800'
      case 'POS_GRADUACAO': return 'bg-pink-100 text-pink-800'
      case 'MESTRADO': return 'bg-indigo-100 text-indigo-800'
      case 'DOUTORADO': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelLabel = () => {
    switch (course.level) {
      case 'FUNDAMENTAL': return 'Ensino Fundamental'
      case 'MEDIO': return 'Ensino Médio'
      case 'SUPERIOR': return 'Ensino Superior'
      case 'POS_GRADUACAO': return 'Pós-Graduação'
      case 'MESTRADO': return 'Mestrado'
      case 'DOUTORADO': return 'Doutorado'
      default: return course.level || 'Não definido'
    }
  }

  const getTypeLabel = () => {
    switch (course.type) {
      case 'PRESENCIAL': return 'Presencial'
      case 'EAD': return 'EAD'
      case 'HIBRIDO': return 'Híbrido'
      default: return course.type || 'Não definido'
    }
  }

  // Função para gerar a cor de fundo baseada no nome do curso
  const getGradientColors = () => {
    const hash = course.name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    const h = Math.abs(hash % 360)
    return `from-blue-600 to-indigo-700`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      <div className={`h-40 bg-gradient-to-br ${getGradientColors()} rounded-t-xl flex items-center justify-center relative overflow-hidden`}>
        <span className="text-white/20 text-6xl font-bold absolute">
          {course.name[0]}
        </span>
        <div className="relative z-10 text-white text-center p-4">
          <h3 className="text-xl font-semibold mb-1">
            {course.name}
          </h3>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="default" className="bg-white/20 text-white border border-white/10">
              {getLevelLabel()}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border border-white/10">
              {getTypeLabel()}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {course.students?.length || 0} {course.students?.length === 1 ? 'Aluno' : 'Alunos'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {course.institution?.name || 'Instituição não definida'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              Criado em {new Date(course.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
          {userType === 'student' ? (
            <Button
              variant="default"
              className="w-full"
              onClick={onAccess}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onAccess}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={onManage}
              >
                <Edit className="w-4 h-4 mr-2" />
                Gerenciar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
