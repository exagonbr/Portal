'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ToastManager'
import { Plus, Edit, Trash, Save, Eye, Code } from 'lucide-react'

interface EmailTemplate {
  id: string | number
  name: string
  subject: string
  message: string
  html?: string
  category?: string
  is_active?: boolean
  created_at?: Date
  updated_at?: Date
}

interface EmailTemplateManagerProps {
  onSave?: (template: EmailTemplate) => Promise<void>
  onDelete?: (id: string | number) => Promise<void>
  templates?: EmailTemplate[]
  loading?: boolean
  className?: string
}

export default function EmailTemplateManager({
  onSave,
  onDelete,
  templates: initialTemplates = [],
  loading = false,
  className = ''
}: EmailTemplateManagerProps) {
  const { showSuccess, showError } = useToast()
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'html'>('text')
  const [previewMode, setPreviewMode] = useState(false)

  // Sincronizar templates quando as props mudarem
  useEffect(() => {
    setTemplates(initialTemplates)
  }, [initialTemplates])

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsEditing(false)
    setPreviewMode(false)
    setActiveTab('text')
  }

  const handleCreateNew = () => {
    const newTemplate: EmailTemplate = {
      id: `new_${Date.now()}`,
      name: 'Novo Template',
      subject: '',
      message: '',
      html: '',
      category: 'general',
      is_active: true
    }
    setSelectedTemplate(newTemplate)
    setIsEditing(true)
    setPreviewMode(false)
    setActiveTab('text')
  }

  const handleEdit = () => {
    setIsEditing(true)
    setPreviewMode(false)
  }

  const handleSave = async () => {
    if (!selectedTemplate) return
    
    if (!selectedTemplate.name.trim()) {
      showError('Nome do template é obrigatório')
      return
    }
    
    if (!selectedTemplate.subject.trim()) {
      showError('Assunto do template é obrigatório')
      return
    }
    
    if (!selectedTemplate.message.trim()) {
      showError('Conteúdo do template é obrigatório')
      return
    }
    
    try {
      if (onSave) {
        await onSave(selectedTemplate)
      }
      
      // Atualizar a lista local
      setTemplates(prev => {
        const index = prev.findIndex(t => t.id === selectedTemplate.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = selectedTemplate
          return updated
        } else {
          return [...prev, selectedTemplate]
        }
      })
      
      setIsEditing(false)
      showSuccess('Template salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      showError('Erro ao salvar template. Tente novamente.')
    }
  }

  const handleDelete = async () => {
    if (!selectedTemplate) return
    
    if (window.confirm(`Tem certeza que deseja excluir o template "${selectedTemplate.name}"?`)) {
      try {
        if (onDelete) {
          await onDelete(selectedTemplate.id)
        }
        
        // Atualizar a lista local
        setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id))
        setSelectedTemplate(null)
        showSuccess('Template excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir template:', error)
        showError('Erro ao excluir template. Tente novamente.')
      }
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!selectedTemplate) return
    
    setSelectedTemplate({
      ...selectedTemplate,
      [field]: value
    })
  }

  const togglePreview = () => {
    setPreviewMode(!previewMode)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Templates de Email</h2>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Templates */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Templates Disponíveis</h3>
          
          {templates.length === 0 ? (
            <div className="text-center p-6 border rounded-lg bg-gray-50">
              <p className="text-gray-500">Nenhum template disponível</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-800">{template.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                  {template.category && (
                    <Badge className="mt-2 text-xs">{template.category}</Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editor/Visualizador de Template */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="text-lg font-medium">
                  {isEditing ? 'Editar Template' : 'Detalhes do Template'}
                </h3>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar
                    </Button>
                  ) : (
                    <>
                      <Button onClick={togglePreview} variant="outline" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        {previewMode ? 'Detalhes' : 'Preview'}
                      </Button>
                      <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button onClick={handleDelete} variant="destructive" className="flex items-center gap-2">
                        <Trash className="w-4 h-4" />
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                {previewMode ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header do email */}
                    <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-600">De:</span>
                          <span className="text-gray-800">Portal Sabercon &lt;noreply@sabercon.com.br&gt;</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <span className="font-medium text-gray-600">Para:</span>
                          <div className="flex-1">
                            <span className="text-gray-800">destinatario@exemplo.com</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-600">Assunto:</span>
                          <span className="text-gray-800 font-medium">
                            {selectedTemplate.subject}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Corpo do email */}
                    <div className="p-6">
                      {/* Mensagem */}
                      <div className="prose max-w-none">
                        {activeTab === 'html' && selectedTemplate.html ? (
                          <div 
                            className="text-gray-700"
                            dangerouslySetInnerHTML={{ __html: selectedTemplate.html }}
                          />
                        ) : (
                          <div 
                            className="text-gray-700 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ 
                              __html: selectedTemplate.message.replace(/\n/g, '<br />') 
                            }}
                          />
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                          Este é um e-mail automático enviado pelo Portal Sabercon.
                          <br />
                          Por favor, não responda a este e-mail.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Template *</Label>
                      <Input
                        id="name"
                        value={selectedTemplate.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ex: Boas-vindas, Lembrete, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Assunto *</Label>
                      <Input
                        id="subject"
                        value={selectedTemplate.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Assunto do email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={selectedTemplate.category || 'general'}
                        onChange={(value) => handleInputChange('category', value)}
                        options={[
                          { value: 'general', label: 'Geral' },
                          { value: 'welcome', label: 'Boas-vindas' },
                          { value: 'notification', label: 'Notificação' },
                          { value: 'reminder', label: 'Lembrete' },
                          { value: 'announcement', label: 'Comunicado' }
                        ]}
                      />
                    </div>

                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'html')}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="text" className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Texto Simples
                        </TabsTrigger>
                        <TabsTrigger value="html" className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          HTML
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="text">
                        <div>
                          <Label htmlFor="message">Conteúdo (Texto) *</Label>
                          <Textarea
                            id="message"
                            value={selectedTemplate.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            placeholder="Digite o conteúdo do email em texto simples"
                            rows={10}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use quebras de linha para formatar o texto. Não é necessário HTML.
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="html">
                        <div>
                          <Label htmlFor="html">Conteúdo (HTML)</Label>
                          <Textarea
                            id="html"
                            value={selectedTemplate.html || ''}
                            onChange={(e) => handleInputChange('html', e.target.value)}
                            placeholder="<h1>Título</h1><p>Conteúdo do email em HTML</p>"
                            rows={10}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use HTML para formatar o email. Este conteúdo será usado apenas quando o HTML estiver ativado.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome</Label>
                      <p className="text-gray-900">{selectedTemplate.name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Assunto</Label>
                      <p className="text-gray-900">{selectedTemplate.subject}</p>
                    </div>

                    {selectedTemplate.category && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Categoria</Label>
                        <Badge>{selectedTemplate.category}</Badge>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Conteúdo</Label>
                      <div className="bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap">
                        {selectedTemplate.message}
                      </div>
                    </div>

                    {selectedTemplate.html && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">HTML</Label>
                        <div className="bg-gray-50 p-4 rounded-lg border overflow-x-auto">
                          <pre className="text-xs">{selectedTemplate.html}</pre>
                        </div>
                      </div>
                    )}

                    {selectedTemplate.created_at && (
                      <div className="pt-4 border-t text-sm text-gray-500">
                        Criado em: {new Date(selectedTemplate.created_at).toLocaleString()}
                        {selectedTemplate.updated_at && selectedTemplate.updated_at !== selectedTemplate.created_at && (
                          <> | Atualizado em: {new Date(selectedTemplate.updated_at).toLocaleString()}</>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border rounded-lg bg-gray-50">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum template selecionado</h3>
                <p className="text-gray-500 mb-6">Selecione um template da lista ou crie um novo</p>
                <Button onClick={handleCreateNew} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Novo Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 