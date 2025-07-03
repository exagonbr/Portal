'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { courseService, getCoursesByTeacher, getCoursesByStudent } from '@/services/courseService'
import CourseCard from '@/components/CourseCard'
import { BookOpen, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CourseResponseDto } from '@/types/api'
import { useToast } from '@/components/ToastManager'
import { CourseAddModal } from '@/components/CourseAddModal'

export default function Courses() {
  const { user } = useAuth()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [courses, setCourses] = useState<CourseResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const loadCourses = async () => {
    if (!user) return

    setLoading(true)
    try {
      let coursesData: CourseResponseDto[] = []

      if ((user.role as string) === 'TEACHER' || (user.role as string) === 'SYSTEM_ADMIN') {
        // Professores e admins veem cursos onde são instrutores
        const response = await getCoursesByTeacher(String(user.id))
        coursesData = response
      } else if ((user.role as string) === 'STUDENT') {
        // Estudantes veem cursos em que estão matriculados
        const response = await getCoursesByStudent(String(user.id))
        coursesData = response
      }

      setCourses(coursesData)
    } catch (error) {
      showError("Erro", "Não foi possível carregar os cursos");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadCourses()
    }
  }, [user])

  const handleCreateCourse = () => {
    setAddModalOpen(true)
  }

  const handleSaveCourse = async (data: any) => {
    try {
      await courseService.createCourse(data)
      showSuccess("Sucesso", "Curso criado com sucesso");
      loadCourses()
      setAddModalOpen(false)
    } catch (error) {
      showError("Erro", "Não foi possível criar o curso");
    }
  }

  const handleAccessCourse = (course: CourseResponseDto) => {
    router.push(`/courses/${course.id}`)
  }

  const handleManageCourse = (course: CourseResponseDto) => {
    router.push(`/courses/manage/${course.id}`)
  }

  if (!user) return null

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            {(user.role as string) === 'TEACHER' || (user.role as string) === 'SYSTEM_ADMIN' ? 'Painel do Professor' : 'Meus Cursos'}
          </h1>
          <p className="text-gray-600">
            Bem-vindo(a), {user?.name}! {(user.role as string) === 'TEACHER' || (user.role as string) === 'SYSTEM_ADMIN' ? 'Acompanhe o progresso dos seus alunos.' : 'Acesse seus cursos e continue estudando.'}
          </p>
        </div>

        {((user.role as string) === 'TEACHER' || (user.role as string) === 'SYSTEM_ADMIN') && (
          <Button onClick={handleCreateCourse}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Criar Novo Curso
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            {(user.role as string) === 'TEACHER' || (user.role as string) === 'SYSTEM_ADMIN' ? 'Você ainda não tem cursos cadastrados' : 'Você não está matriculado em nenhum curso'}
          </h3>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            {(user.role as string) === 'TEACHER' || (user.role as string) === 'SYSTEM_ADMIN'
              ? 'Crie seu primeiro curso para começar a gerenciar suas aulas e alunos.'
              : 'Entre em contato com sua instituição para se matricular em cursos disponíveis.'}
          </p>
          {((user.role as string) === 'TEACHER' || (user.role as string) === 'SYSTEM_ADMIN') && (
            <Button onClick={handleCreateCourse}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Criar Primeiro Curso
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              userType={(user.role as string) === 'STUDENT' ? 'student' : 'teacher'}
              onAccess={() => handleAccessCourse(course)}
              onManage={() => handleManageCourse(course)}
            />
          ))}
        </div>
      )}

      {addModalOpen && (
        <CourseAddModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={handleSaveCourse}
          title="Adicionar Curso"
        />
      )}
    </div>
  )
}