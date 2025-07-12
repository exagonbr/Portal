'use client'

import React, { useState, useEffect } from 'react'
import { EmailTemplate, EmailTemplateCategory } from '@/types/email'
import { emailTemplateService } from '@/services/emailTemplateService'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Card, { CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ToastManager'
import { 
  Search, 
  Plus, 
  Edit, 
  Copy, 
  Trash, 
  Eye, 
  Filter,
  Download,
  Upload,
  MoreVertical
} from 'lucide-react'

interface EmailTemplateSelectorProps {
  selectedTemplate?: EmailTemplate | null
  onTemplateSelect: (template: EmailTemplate | null) => void
  onTemplateCreate?: () => void
  showCreateButton?: boolean
  showManagement?: boolean
  className?: string
}

export default function EmailTemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  onTemplateCreate,
  showCreateButton = true,
  showManagement = false,
  className = ''
}: EmailTemplateSelectorProps) {
  const { showSuccess, showError } = useToast()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EmailTemplateCategory | 'all'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState<string | null>(null)

  // Carregar templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Filtrar templates
  useEffect(() => {
    let filtered = templates

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Filtrar por busca
    if (searchQuery.trim()) {
      filtered = emailTemplateService.searchTemplates(searchQuery)
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(t => t.category === selectedCategory)
      }
    }

    // Mostrar apenas ativos
    filtered = filtered.filter(t => t.isActive)

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, selectedCategory])

  const loadTemplates = () => {
    try {
      const allTemplates = emailTemplateService.getAllTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
      showError('Erro ao carregar templates de email')
    }
  }

  const handleTemplateSelect = (template: EmailTemplate) => {
    onTemplateSelect(template)
    setShowMenu(null)
  }

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    try {
      const duplicated = emailTemplateService.duplicateTemplate(template.id)
      if (duplicated) {
        loadTemplates()
        showSuccess(`Template "${template.name}" duplicado com sucesso`)
      }
    } catch (error: any) {
      showError(error.message || 'Erro ao duplicar template')
    }
    setShowMenu(null)
  }

  const handleDeleteTemplate = (template: EmailTemplate) => {
    if (template.isBuiltIn) {
      showError('Templates padrão não podem ser excluídos')
      return
    }

    if (confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      try {
        const deleted = emailTemplateService.deleteTemplate(template.id)
        if (deleted) {
          loadTemplates()
          if (selectedTemplate?.id === template.id) {
            onTemplateSelect(null)
          }
          showSuccess('Template excluído com sucesso')
        }
      } catch (error: any) {
        showError(error.message || 'Erro ao excluir template')
      }
    }
    setShowMenu(null)
  }

  const exportTemplates = () => {
    try {
      const data = emailTemplateService.exportTemplates()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `email-templates-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showSuccess('Templates exportados com sucesso')
    } catch (error: any) {
      showError('Erro ao exportar templates')
    }
  }

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const result = emailTemplateService.importTemplates(content)
        
        if (result.success > 0) {
          loadTemplates()
          showSuccess(`${result.success} template(s) importado(s) com sucesso`)
        }
        
        if (result.errors.length > 0) {
          showError(`Erros na importação: ${result.errors.join(', ')}`)
        }
      } catch (error: any) {
        showError('Erro ao importar templates')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  const getCategoryOptions = () => [
    { value: 'all', label: 'Todas as categorias' },
    { value: EmailTemplateCategory.WELCOME, label: 'Boas-vindas' },
    { value: EmailTemplateCategory.REMINDER, label: 'Lembretes' },
    { value: EmailTemplateCategory.ANNOUNCEMENT, label: 'Comunicados' },
    { value: EmailTemplateCategory.NOTIFICATION, label: 'Notificações' },
    { value: EmailTemplateCategory.MARKETING, label: 'Marketing' },
    { value: EmailTemplateCategory.SYSTEM, label: 'Sistema' },
    { value: EmailTemplateCategory.CUSTOM, label: 'Personalizados' }
  ]

  const getCategoryBadgeColor = (category: EmailTemplateCategory) => {
    const colors = {
      [EmailTemplateCategory.WELCOME]: 'bg-green-100 text-green-800',
      [EmailTemplateCategory.REMINDER]: 'bg-yellow-100 text-yellow-800',
      [EmailTemplateCategory.ANNOUNCEMENT]: 'bg-blue-100 text-blue-800',
      [EmailTemplateCategory.NOTIFICATION]: 'bg-purple-100 text-purple-800',
      [EmailTemplateCategory.MARKETING]: 'bg-pink-100 text-pink-800',
      [EmailTemplateCategory.SYSTEM]: 'bg-gray-100 text-gray-800',
      [EmailTemplateCategory.CUSTOM]: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Templates de Email</h3>
          <div className="flex items-center gap-2">
            {showManagement && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTemplates}
                  className="flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTemplates}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    Importar
                  </Button>
                </div>
              </>
            )}
            {showCreateButton && onTemplateCreate && (
              <Button
                onClick={onTemplateCreate}
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Novo Template
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value as EmailTemplateCategory | 'all')}
              options={getCategoryOptions()}
            />
          </div>
        </div>

        {/* Lista de Templates */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Nenhum template encontrado com os filtros aplicados'
                : 'Nenhum template disponível'
              }
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-gray-300 ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{template.icon}</span>
                      <h4 className="font-medium text-gray-900 truncate">
                        {template.name}
                      </h4>
                      <Badge className={getCategoryBadgeColor(template.category)}>
                        {template.category}
                      </Badge>
                      {template.isBuiltIn && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Padrão
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {template.subject}
                    </p>
                    {template.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                  
                  {showManagement && (
                    <div className="relative ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenu(showMenu === template.id ? null : template.id)
                        }}
                        className="p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      {showMenu === template.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-32">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicateTemplate(template)
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-3 h-3" />
                            Duplicar
                          </button>
                          {!template.isBuiltIn && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTemplate(template)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash className="w-3 h-3" />
                              Excluir
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Template selecionado */}
        {selectedTemplate && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedTemplate.icon}</span>
                <span className="font-medium text-blue-900">
                  Template selecionado: {selectedTemplate.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTemplateSelect(null)}
                className="text-blue-600"
              >
                Limpar
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
} 