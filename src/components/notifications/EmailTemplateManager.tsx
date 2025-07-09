'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { CardHeader, CardBody } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ToastManager'
import { Plus, Edit, Trash, Save, Eye, Code, Bold, Italic, Underline, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3 } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'

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

// Componente para o menu de edição do Tiptap
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('URL da imagem:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)
    
    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border border-gray-200 rounded-t-lg p-2 flex flex-wrap gap-1 bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        title="Negrito"
      >
        <Bold className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        title="Itálico"
      >
        <Italic className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
        title="Sublinhado"
      >
        <Underline className="w-5 h-5" />
      </button>
      <div className="border-r border-gray-300 mx-1 h-6"></div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
        title="Título 1"
      >
        <Heading1 className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
        title="Título 2"
      >
        <Heading2 className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
        title="Título 3"
      >
        <Heading3 className="w-5 h-5" />
      </button>
      <div className="border-r border-gray-300 mx-1 h-6"></div>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        title="Lista com marcadores"
      >
        <List className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        title="Lista numerada"
      >
        <ListOrdered className="w-5 h-5" />
      </button>
      <div className="border-r border-gray-300 mx-1 h-6"></div>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        title="Alinhar à esquerda"
      >
        <AlignLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        title="Centralizar"
      >
        <AlignCenter className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        title="Alinhar à direita"
      >
        <AlignRight className="w-5 h-5" />
      </button>
      <div className="border-r border-gray-300 mx-1 h-6"></div>
      <button
        onClick={setLink}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
        title="Inserir link"
      >
        <Link className="w-5 h-5" />
      </button>
      <button
        onClick={addImage}
        className="p-1 rounded hover:bg-gray-200"
        title="Inserir imagem"
      >
        <Image className="w-5 h-5" />
      </button>
      <div className="border-r border-gray-300 mx-1 h-6"></div>
      <input
        type="color"
        onInput={e => {
          editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
        }}
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="w-8 h-8 p-0 border rounded cursor-pointer"
        title="Cor do texto"
      />
    </div>
  )
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
  
  // Editor para HTML
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Escreva seu conteúdo aqui...',
      }),
      TextStyle,
      Color,
    ],
    content: selectedTemplate?.html || '',
    onUpdate: ({ editor }) => {
      if (selectedTemplate) {
        handleInputChange('html', editor.getHTML())
      }
    },
  })

  // Atualizar conteúdo do editor quando o template selecionado muda
  useEffect(() => {
    if (editor && selectedTemplate) {
      editor.commands.setContent(selectedTemplate.html || '')
    }
  }, [editor, selectedTemplate])

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
    
    if (!selectedTemplate.message.trim() && !selectedTemplate.html?.trim()) {
      showError('Conteúdo do template é obrigatório (texto ou HTML)')
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
                          Editor HTML
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
                          <Label htmlFor="html">Editor HTML</Label>
                          <div className="border rounded-lg overflow-hidden">
                            <MenuBar editor={editor} />
                            <div className="bg-white p-4 min-h-[300px]">
                              <EditorContent editor={editor} className="prose max-w-none focus:outline-none min-h-[250px]" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Use o editor acima para formatar o conteúdo HTML do seu email.
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
                        <div className="bg-gray-50 p-4 rounded-lg border overflow-hidden">
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
                          </div>
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