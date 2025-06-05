'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'
import { ThemeSelector } from '@/components/ui/ThemeSelector'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Table from '@/components/ui/Table'
import StatsGrid from '@/components/dashboard/StatsGrid'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export default function ThemeDemoPage() {
  const { theme } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    description: ''
  })
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Sample data for table
  const tableData = [
    { id: '1', name: 'João Silva', email: 'joao@example.com', role: 'Professor', status: 'Ativo', date: '2024-01-15' },
    { id: '2', name: 'Maria Santos', email: 'maria@example.com', role: 'Aluno', status: 'Ativo', date: '2024-01-16' },
    { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', role: 'Coordenador', status: 'Inativo', date: '2024-01-17' },
    { id: '4', name: 'Ana Oliveira', email: 'ana@example.com', role: 'Professor', status: 'Ativo', date: '2024-01-18' },
    { id: '5', name: 'Carlos Ferreira', email: 'carlos@example.com', role: 'Aluno', status: 'Ativo', date: '2024-01-19' },
  ]

  const tableColumns = [
    {
      key: 'name',
      title: 'Nome',
      sortable: true,
      render: (value: string, record: any) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ 
              backgroundColor: theme.colors.primary.light + '20',
              color: theme.colors.primary.DEFAULT
            }}
          >
            {value.charAt(0)}
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { key: 'email', title: 'Email', sortable: true },
    { 
      key: 'role', 
      title: 'Função', 
      sortable: true,
      render: (value: string) => (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: theme.colors.secondary.light + '20',
            color: theme.colors.secondary.DEFAULT
          }}
        >
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      title: 'Status', 
      sortable: true,
      render: (value: string) => (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: value === 'Ativo' 
              ? theme.colors.status.success + '20'
              : theme.colors.status.error + '20',
            color: value === 'Ativo' 
              ? theme.colors.status.success
              : theme.colors.status.error
          }}
        >
          {value}
        </span>
      )
    },
    { key: 'date', title: 'Data', sortable: true }
  ]

  const roleOptions = [
    { value: 'teacher', label: 'Professor' },
    { value: 'student', label: 'Aluno' },
    { value: 'coordinator', label: 'Coordenador' },
    { value: 'manager', label: 'Gestor' }
  ]

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: theme.colors.background.primary }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: theme.colors.text.primary }}
            >
              Demonstração do Sistema de Temas
            </h1>
            <p style={{ color: theme.colors.text.secondary }}>
              Explore todos os componentes com os diferentes temas disponíveis
            </p>
          </div>
          <ThemeSelector />
        </div>

        {/* Stats Grid */}
        <section>
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: theme.colors.text.primary }}
          >
            Dashboard - Estatísticas por Role
          </h2>
          <StatsGrid userRole={UserRole.TEACHER} stats={[]} />
        </section>

        {/* Form Components */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card shadow="lg" className="p-6">
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: theme.colors.text.primary }}
            >
              Componentes de Formulário
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Nome Completo"
                placeholder="Digite seu nome"
                leftIcon="person"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                leftIcon="mail"
                rightIcon="check_circle"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                helperText="Usaremos este email para contato"
              />
              
              <Select
                label="Função"
                placeholder="Selecione uma função"
                options={roleOptions}
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value as string })}
                searchable
              />
              
              <Textarea
                label="Descrição"
                placeholder="Conte-nos mais sobre você..."
                value={formData.description}
                                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                showCharCount
                maxLength={200}
                autoResize
              />
            </div>
          </Card>

          <Card glass className="p-6">
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: theme.colors.text.primary }}
            >
              Botões e Ações
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" icon={<span className="material-symbols-outlined">add</span>}>Criar Novo</Button>
                <Button variant="secondary" icon={<span className="material-symbols-outlined">edit</span>}>Editar</Button>
                <Button variant="outline" icon={<span className="material-symbols-outlined">delete</span>}>Excluir</Button>
                <Button variant="ghost" icon={<span className="material-symbols-outlined">refresh</span>}>Atualizar</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button size="sm" gradient>Pequeno</Button>
                <Button size="md" gradient>Médio</Button>
                <Button size="lg" gradient>Grande</Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" loading>Carregando...</Button>
                <Button variant="secondary" disabled>Desabilitado</Button>
                <Button variant="primary" glow>Com Brilho</Button>
              </div>
              
              <Button 
                variant="primary" 
                fullWidth 
                onClick={() => setIsModalOpen(true)}
                icon={<span className="material-symbols-outlined">visibility</span>}
              >
                Abrir Modal de Exemplo
              </Button>
            </div>
          </Card>
        </section>

        {/* Table */}
        <section>
          <Card className="p-6">
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: theme.colors.text.primary }}
            >
              Tabela com Ordenação e Paginação
            </h3>
            
            <Table
              columns={tableColumns}
              data={tableData}
              pagination={{
                current: 1,
                pageSize: 5,
                total: tableData.length,
                onChange: (page, pageSize) => console.log('Page:', page, 'PageSize:', pageSize)
              }}
              onRow={(record) => ({
                onClick: () => {
                  const newSelected = selectedRows.includes(record.id)
                    ? selectedRows.filter(id => id !== record.id)
                    : [...selectedRows, record.id]
                  setSelectedRows(newSelected)
                },
                className: selectedRows.includes(record.id) ? 'bg-primary/10' : ''
              })}
              striped
              hoverable
            />
          </Card>
        </section>

        {/* Different Card Variants */}
        <section>
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: theme.colors.text.primary }}
          >
            Variantes de Cards
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover>
              <div className="p-6">
                <h4 className="font-semibold mb-2" style={{ color: theme.colors.text.primary }}>
                  Card Padrão
                </h4>
                <p style={{ color: theme.colors.text.secondary }}>
                  Este é um card com estilo padrão e efeito hover.
                </p>
              </div>
            </Card>
            
            <Card shadow="xl" gradient hover>
              <div className="p-6">
                <h4 className="font-semibold mb-2" style={{ color: theme.colors.text.primary }}>
                  Card Elevado com Gradiente
                </h4>
                <p style={{ color: theme.colors.text.secondary }}>
                  Card com sombra elevada e gradiente de fundo.
                </p>
              </div>
            </Card>
            
            <Card glass hover>
              <div className="p-6">
                <h4 className="font-semibold mb-2" style={{ color: theme.colors.text.primary }}>
                  Card Glass Morphism
                </h4>
                <p style={{ color: theme.colors.text.secondary }}>
                  Efeito de vidro com transparência e blur.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Modal de Exemplo"
          size="lg"
        >
          <div className="p-6 space-y-4">
            <p style={{ color: theme.colors.text.primary }}>
              Este é um modal com animações suaves e suporte completo ao sistema de temas.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Campo no Modal"
                placeholder="Digite algo..."
                leftIcon="edit"
              />
                             <Select
                 label="Seleção no Modal"
                 options={roleOptions}
                 placeholder="Escolha uma opção"
                 onChange={(value) => console.log('Selected:', value)}
               />
            </div>
            
            <Textarea
              label="Observações"
              placeholder="Adicione suas observações aqui..."
              rows={3}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" gradient onClick={() => setIsModalOpen(false)}>
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </div>
  )
} 