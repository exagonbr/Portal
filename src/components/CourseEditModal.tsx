'use client'

import React, { useState, useEffect } from 'react';

interface CourseDisplayData {
  id: string;
  name: string;
  description: string;
  institutionId: string;
  institutionName: string;
  category: 'Exatas' | 'Humanas' | 'Ciências' | 'Linguagens' | 'Técnico';
  status: 'Ativo' | 'Inativo' | 'Em Desenvolvimento';
  imageUrl?: string;
  studentCount: number;
  teacherCount: number;
  duration: string;
  level: 'Básico' | 'Intermediário' | 'Avançado';
  rating: number;
  progress?: number;
  startDate?: string;
  endDate?: string;
  coordinator?: string;
  price?: number;
  certificateAvailable: boolean;
}

interface CourseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseDisplayData | null;
}

export default function CourseEditModal({ isOpen, onClose, course }: CourseEditModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<CourseDisplayData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData(course);
      setActiveTab('info');
      setEditMode(false);
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    console.log('Salvando dados do curso:', formData);
    setEditMode(false);
    alert('Dados salvos com sucesso!');
  };

  const handleCancel = () => {
    setFormData(course);
    setEditMode(false);
  };

  const handleDelete = () => {
    console.log('Deletando curso:', course.id);
    setShowDeleteConfirm(false);
    onClose();
    alert('Curso removido com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-success-DEFAULT text-white';
      case 'Inativo': return 'bg-error-DEFAULT text-white';
      case 'Em Desenvolvimento': return 'bg-warning-DEFAULT text-text-primary';
      default: return 'bg-secondary-DEFAULT text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Exatas': '🔢',
      'Humanas': '📚',
      'Ciências': '🔬',
      'Linguagens': '🗣️',
      'Técnico': '⚙️'
    };
    return icons[category] || '📖';
  };

  return (
    <>
      <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getCategoryIcon(formData.category || course.category)}</span>
                  <h2 className="text-2xl font-bold">{formData.name || course.name}</h2>
                  {editMode && (
                    <span className="px-2 py-1 bg-primary-dark/70 rounded text-xs">
                      Modo Edição
                    </span>
                  )}
                </div>
                <p className="text-primary-light/80 mb-3">{formData.institutionName || course.institutionName}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status || course.status)}`}>
                    {formData.status || course.status}
                  </span>
                  <span className="px-3 py-1 bg-primary-light/30 rounded-full text-sm text-white">
                    {formData.category || course.category}
                  </span>
                  <span className="px-3 py-1 bg-primary-dark/50 rounded-full text-sm text-white">
                    {formData.level || course.level}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-primary-light/70 transition-colors ml-4 p-1 rounded-full hover:bg-white/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border-DEFAULT bg-background-secondary">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'info', label: 'Informações Gerais', icon: '📋' },
                { id: 'conteudo', label: 'Conteúdo Programático', icon: '📚' },
                { id: 'participantes', label: 'Participantes', icon: '👥' },
                { id: 'avaliacoes', label: 'Avaliações', icon: '⭐' },
                { id: 'financeiro', label: 'Financeiro', icon: '💰' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-DEFAULT text-primary-DEFAULT bg-background-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-light'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Informações do Curso</h3>
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark"
                    >
                      Editar
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-success-DEFAULT text-white rounded-lg hover:bg-success-dark"
                      >
                        Salvar
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Curso</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.name || course.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
                    {editMode ? (
                      <select
                        name="category"
                        value={formData.category || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      >
                        <option value="Exatas">Exatas</option>
                        <option value="Humanas">Humanas</option>
                        <option value="Ciências">Ciências</option>
                        <option value="Linguagens">Linguagens</option>
                        <option value="Técnico">Técnico</option>
                      </select>
                    ) : (
                      <p className="text-text-primary py-2">{formData.category || course.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                    {editMode ? (
                      <select
                        name="status"
                        value={formData.status || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                      </select>
                    ) : (
                      <p className="text-text-primary py-2">{formData.status || course.status}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nível</label>
                    {editMode ? (
                      <select
                        name="level"
                        value={formData.level || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      >
                        <option value="Básico">Básico</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                    ) : (
                      <p className="text-text-primary py-2">{formData.level || course.level}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Duração</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.duration || course.duration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Coordenador</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="coordinator"
                        value={formData.coordinator || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.coordinator || course.coordinator || 'Não definido'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                    {editMode ? (
                      <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.description || course.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data de Início</label>
                    {editMode ? (
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">
                        {formData.startDate ? new Date(formData.startDate).toLocaleDateString('pt-BR') : course.startDate ? new Date(course.startDate).toLocaleDateString('pt-BR') : 'Não definido'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data de Término</label>
                    {editMode ? (
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">
                        {formData.endDate ? new Date(formData.endDate).toLocaleDateString('pt-BR') : course.endDate ? new Date(course.endDate).toLocaleDateString('pt-BR') : 'Não definido'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-3">Estatísticas do Curso</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Alunos Matriculados</p>
                      <p className="font-medium text-text-primary text-lg">{course.studentCount}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Professores</p>
                      <p className="font-medium text-text-primary text-lg">{course.teacherCount}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Avaliação</p>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-text-primary text-lg">{course.rating}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= course.rating ? 'text-accent-yellow-DEFAULT' : 'text-secondary-light'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'conteudo' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Conteúdo Programático</h3>
                <div className="space-y-4">
                  {/* Exemplo de módulos */}
                  {[
                    { name: 'Módulo 1: Introdução', duration: '2 semanas', status: 'Concluído' },
                    { name: 'Módulo 2: Conceitos Básicos', duration: '3 semanas', status: 'Em Andamento' },
                    { name: 'Módulo 3: Práticas Avançadas', duration: '4 semanas', status: 'Planejado' }
                  ].map((module, index) => (
                    <div key={index} className="bg-background-secondary rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-text-primary">{module.name}</h4>
                          <p className="text-sm text-text-secondary">{module.duration}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          module.status === 'Concluído' ? 'bg-success-light text-success-dark' :
                          module.status === 'Em Andamento' ? 'bg-warning-light text-warning-dark' :
                          'bg-info-light text-info-dark'
                        }`}>
                          {module.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'participantes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Participantes do Curso</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary-light/10 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-primary-DEFAULT mb-2">{course.studentCount}</div>
                    <div className="text-sm text-text-secondary">Alunos Matriculados</div>
                  </div>
                  <div className="bg-success-light/10 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-success-DEFAULT mb-2">{course.teacherCount}</div>
                    <div className="text-sm text-text-secondary">Professores</div>
                  </div>
                  <div className="bg-accent-purple-light/10 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-accent-purple-DEFAULT mb-2">{Math.round(course.studentCount * 0.85)}</div>
                    <div className="text-sm text-text-secondary">Alunos Ativos</div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-medium text-text-primary mb-4">Lista de Alunos</h4>
                  <div className="space-y-3">
                    {/* Exemplo de alunos */}
                    {[
                      { name: 'João Silva', email: 'joao@example.com', progress: 85 },
                      { name: 'Maria Santos', email: 'maria@example.com', progress: 92 },
                      { name: 'Pedro Costa', email: 'pedro@example.com', progress: 78 }
                    ].map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary">{student.name}</p>
                          <p className="text-sm text-text-secondary">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-text-primary">{student.progress}%</p>
                          <div className="w-20 bg-secondary-light rounded-full h-2 mt-1">
                            <div className="bg-primary-DEFAULT h-2 rounded-full" style={{ width: `${student.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'avaliacoes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Avaliações do Curso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background-secondary rounded-lg p-6">
                    <h4 className="font-medium text-text-primary mb-4">Distribuição de Notas</h4>
                    <div className="space-y-3">
                      {[
                        { rating: 5, count: 120, percentage: 60 },
                        { rating: 4, count: 60, percentage: 30 },
                        { rating: 3, count: 16, percentage: 8 },
                        { rating: 2, count: 3, percentage: 1.5 },
                        { rating: 1, count: 1, percentage: 0.5 }
                      ].map((item) => (
                        <div key={item.rating} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-text-primary w-8">{item.rating}★</span>
                          <div className="flex-1 bg-secondary-light rounded-full h-2">
                            <div className="bg-accent-yellow-DEFAULT h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                          </div>
                          <span className="text-sm text-text-secondary">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-background-secondary rounded-lg p-6">
                    <h4 className="font-medium text-text-primary mb-4">Comentários Recentes</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Ana Silva', rating: 5, comment: 'Excelente curso, muito bem estruturado!' },
                        { name: 'Carlos Santos', rating: 4, comment: 'Bom conteúdo, mas poderia ter mais exemplos práticos.' },
                        { name: 'Luiza Costa', rating: 5, comment: 'Recomendo para todos!' }
                      ].map((review, index) => (
                        <div key={index} className="border-l-4 border-primary-DEFAULT pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-text-primary">{review.name}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-3 h-3 ${star <= review.rating ? 'text-accent-yellow-DEFAULT' : 'text-secondary-light'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-text-secondary">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Informações Financeiras</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Preço do Curso</label>
                    {editMode ? (
                      <input
                        type="number"
                        name="price"
                        value={formData.price || ''}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">
                        {course.price ? `R$ ${course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Gratuito'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="certificateAvailable"
                        checked={formData.certificateAvailable ?? course.certificateAvailable}
                        onChange={handleCheckboxChange}
                        disabled={!editMode}
                        className="sr-only"
                      />
                      <div className={`relative inline-block w-10 h-6 transition duration-200 ease-in-out rounded-full ${
                        formData.certificateAvailable ?? course.certificateAvailable ? 'bg-primary-DEFAULT' : 'bg-secondary-light'
                      } ${!editMode ? 'opacity-50' : ''}`}>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                          formData.certificateAvailable ?? course.certificateAvailable ? 'translate-x-4' : 'translate-x-0'
                        }`}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-text-primary">Certificado Disponível</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-3">Resumo Financeiro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Receita Total</p>
                      <p className="font-medium text-text-primary text-lg">
                        R$ {course.price ? (course.price * course.studentCount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Alunos Pagantes</p>
                      <p className="font-medium text-text-primary text-lg">{course.price ? course.studentCount : 0}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Ticket Médio</p>
                      <p className="font-medium text-text-primary text-lg">
                        R$ {course.price ? course.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border-light px-6 py-4 bg-background-secondary">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-sm text-text-tertiary">
                  Última atualização: {new Date().toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
                {!editMode && activeTab === 'info' && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-error-DEFAULT hover:text-error-dark"
                  >
                    Excluir Curso
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-secondary-light text-text-primary rounded-lg hover:bg-secondary-DEFAULT/80 transition-colors"
                >
                  Fechar
                </button>
                {activeTab === 'info' && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Editar Informações
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
                    >
                      Cancelar Edição
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-success-DEFAULT text-white rounded-lg hover:bg-success-dark"
                    >
                      Salvar Alterações
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-background-primary rounded-lg p-6 max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Confirmar Exclusão</h3>
            <p className="text-text-secondary mb-6">
              Tem certeza que deseja excluir o curso "{course.name}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border-DEFAULT text-text-primary rounded-lg hover:bg-background-tertiary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-error-DEFAULT text-white rounded-lg hover:bg-error-dark"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 