'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { courseService } from '@/services/courseService'
import GenericCRUD, { CRUDColumn } from '@/components/crud/GenericCRUD'
import { CourseResponseDto } from '@/types/api'
import { useToast } from '@/hooks/useToast'
import { CourseAddModal } from '@/components/CourseAddModal'
import { CourseEditModal } from '@/components/CourseEditModal'
import { Badge } from '@/components/ui/Badge'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function ManageCourses() {
  const router = useRouter()
  const { showError, showSuccess } = useToast()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<CourseResponseDto[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseResponseDto | null>(null)

  const fetchCourses = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const response = await courseService.getCourses({
        page,
        limit: itemsPerPage,
        filters: { search }
      })
      
      setCourses(response.items || [])
      setTotalItems(response.total || 0)
      setCurrentPage(page)
    } catch (error) {
      showError("Erro ao carregar cursos", "Não foi possível carregar a lista de cursos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses(currentPage, searchQuery)
  }, [currentPage])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    fetchCourses(1, query)
  }

  const handleAddCourse = () => {
    setAddModalOpen(true)
  }

  const handleEditCourse = (course: CourseResponseDto) => {
    setSelectedCourse(course)
    setEditModalOpen(true)
  }

  const handleDeleteCourse = async (course: CourseResponseDto) => {
    try {
      await courseService.deleteCourse(course.id)
      showSuccess("Curso excluído", "O curso foi excluído com sucesso.")
      fetchCourses(currentPage, searchQuery)
    } catch (error) {
      showError("Erro ao excluir curso", "Não foi possível excluir o curso.")
    }
  }

  const handleSaveCourse = async (data: any) => {
    try {
      if (selectedCourse) {
        await courseService.updateCourse(selectedCourse.id, data)
        toast({
          title: "Curso atualizado",
          description: "O curso foi atualizado com sucesso.",
          variant: "success"
        })
      } else {
        await courseService.createCourse(data)
        toast({
          title: "Curso criado",
          description: "O curso foi criado com sucesso.",
          variant: "success"
        })
      }
      setAddModalOpen(false)
      setEditModalOpen(false)
      setSelectedCourse(null)
      fetchCourses(currentPage, searchQuery)
    } catch (error) {
      toast({
        title: "Erro ao salvar curso",
        description: "Não foi possível salvar o curso.",
        variant: "destructive"
      })
    }
  }

  const handleViewCourse = (course: CourseResponseDto) => {
    router.push(`/courses/${course.id}`)
  }

  const columns: CRUDColumn<CourseResponseDto>[] = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true
    },
    {
      key: 'level',
      label: 'Nível',
      sortable: true
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true
    },
    {
      key: 'active',
      label: 'Status',
      render: (course) => (
        <Badge variant={course.active ? "success" : "danger"}>
          {course.active ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
    {
      key: 'students_count',
      label: 'Alunos',
      sortable: true
    }
  ]

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8">
        <GenericCRUD
          title="Gerenciamento de Cursos"
          entityName="Curso"
          entityNamePlural="Cursos"
          columns={columns}
          data={courses}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onSearch={handleSearch}
          onCreate={handleAddCourse}
          onEdit={handleEditCourse}
          onDelete={handleDeleteCourse}
          onView={handleViewCourse}
          searchPlaceholder="Buscar cursos..."
          createPermission="courses.create"
          editPermission="courses.edit"
          deletePermission="courses.delete"
          viewPermission="courses.view"
        />

        {addModalOpen && (
          <CourseAddModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSave={handleSaveCourse}
            title="Adicionar Curso"
          />
        )}

        {editModalOpen && selectedCourse && (
          <CourseEditModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false)
              setSelectedCourse(null)
            }}
            onSave={handleSaveCourse}
            course={selectedCourse}
            title="Editar Curso"
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}
