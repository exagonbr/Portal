'use client'

import React, { useState, useEffect } from 'react';

interface StudentDisplayData {
  id: string;
  name: string;
  email: string;
  registration: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  institutionId: string;
  institutionName: string;
  courseId: string;
  courseName: string;
  classGroup: string;
  status: 'Ativo' | 'Inativo' | 'Trancado' | 'Formado';
  imageUrl?: string;
  attendance: number;
  grade: number;
  enrollmentDate: string;
  lastActivity?: string;
  guardian?: {
    name: string;
    phone: string;
    email: string;
    relationship: string;
  };
}

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDisplayData | null;
}

export default function StudentEditModal({ isOpen, onClose, student }: StudentEditModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<StudentDisplayData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData(student);
      setActiveTab('info');
      setEditMode(false);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name.split('.')[1];
    setFormData(prev => ({
      ...prev,
      guardian: {
        name: prev.guardian?.name || '',
        phone: prev.guardian?.phone || '',
        email: prev.guardian?.email || '',
        relationship: prev.guardian?.relationship || '',
        ...prev.guardian,
        [fieldName]: value
      }
    }));
  };

  const handleSave = () => {
    console.log('Salvando dados do aluno:', formData);
    setEditMode(false);
    alert('Dados salvos com sucesso!');
  };

  const handleCancel = () => {
    setFormData(student);
    setEditMode(false);
  };

  const handleDelete = () => {
    console.log('Deletando aluno:', student.id);
    setShowDeleteConfirm(false);
    onClose();
    alert('Aluno removido com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-success-DEFAULT text-white';
      case 'Inativo': return 'bg-error-DEFAULT text-white';
      case 'Trancado': return 'bg-warning-DEFAULT text-text-primary';
      case 'Formado': return 'bg-info-DEFAULT text-white';
      default: return 'bg-secondary-DEFAULT text-white';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 7) return 'text-success-DEFAULT';
    if (grade >= 5) return 'text-warning-DEFAULT';
    return 'text-error-DEFAULT';
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 75) return 'text-success-DEFAULT';
    if (attendance >= 50) return 'text-warning-DEFAULT';
    return 'text-error-DEFAULT';
  };

  return (
    <>
      <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt={formData.name}
                    className="w-20 h-20 rounded-full border-4 border-white"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{formData.name || student.name}</h2>
                    {editMode && (
                      <span className="px-2 py-1 bg-primary-dark/70 rounded text-xs">
                        Modo Edição
                      </span>
                    )}
                  </div>
                  <p className="text-primary-light/80 mb-1">Matrícula: {formData.registration || student.registration}</p>
                  <p className="text-primary-light/80 mb-3">{formData.courseName || student.courseName}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status || student.status)}`}>
                      {formData.status || student.status}
                    </span>
                    <span className="px-3 py-1 bg-primary-light/30 rounded-full text-sm text-white">
                      Turma {formData.classGroup || student.classGroup}
                    </span>
                  </div>
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
                { id: 'info', label: 'Informações Pessoais', icon: '👤' },
                { id: 'academico', label: 'Dados Acadêmicos', icon: '🎓' },
                { id: 'desempenho', label: 'Desempenho', icon: '📊' },
                { id: 'responsavel', label: 'Responsável', icon: '👨‍👩‍👧' },
                { id: 'historico', label: 'Histórico', icon: '📝' }
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
                  <h3 className="text-lg font-semibold text-text-primary">Informações Pessoais</h3>
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
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.name || student.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">CPF</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="cpf"
                        value={formData.cpf || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.cpf || student.cpf || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.email || student.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Telefone</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.phone || student.phone || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data de Nascimento</label>
                    {editMode ? (
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.birthDate || student.birthDate || 'Não informada'}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Endereço</label>
                    {editMode ? (
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.address || student.address || 'Não informado'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academico' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Dados Acadêmicos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Instituição</label>
                    <p className="text-text-primary py-2">{formData.institutionName || student.institutionName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Curso</label>
                    <p className="text-text-primary py-2">{formData.courseName || student.courseName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Turma</label>
                    <p className="text-text-primary py-2">{formData.classGroup || student.classGroup}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status || student.status)}`}>
                      {formData.status || student.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data de Matrícula</label>
                    <p className="text-text-primary py-2">{new Date(formData.enrollmentDate || student.enrollmentDate).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Última Atividade</label>
                    <p className="text-text-primary py-2">{formData.lastActivity ? new Date(formData.lastActivity).toLocaleDateString('pt-BR') : 'Não registrada'}</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-background-secondary rounded-lg">
                  <h4 className="font-medium text-text-primary mb-3">Informações Adicionais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Período Atual</p>
                      <p className="font-medium text-text-primary">3º Semestre</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Créditos Completados</p>
                      <p className="font-medium text-text-primary">45/180</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Disciplinas Cursadas</p>
                      <p className="font-medium text-text-primary">12</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Disciplinas em Andamento</p>
                      <p className="font-medium text-text-primary">5</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'desempenho' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Desempenho Acadêmico</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary-light/10 rounded-lg p-6 text-center">
                    <div className={`text-3xl font-bold mb-2 ${getGradeColor(student.grade)}`}>
                      {student.grade.toFixed(1)}
                    </div>
                    <div className="text-sm text-text-secondary">Média Geral</div>
                  </div>
                  <div className="bg-success-light/10 rounded-lg p-6 text-center">
                    <div className={`text-3xl font-bold mb-2 ${getAttendanceColor(student.attendance)}`}>
                      {student.attendance}%
                    </div>
                    <div className="text-sm text-text-secondary">Frequência</div>
                  </div>
                  <div className="bg-accent-purple-light/10 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-accent-purple-DEFAULT mb-2">15°</div>
                    <div className="text-sm text-text-secondary">Ranking da Turma</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-text-primary">Desempenho por Disciplina</h4>
                  <div className="space-y-3">
                    {[
                      { subject: 'Matemática', grade: 8.5, attendance: 95 },
                      { subject: 'Física', grade: 7.8, attendance: 90 },
                      { subject: 'Química', grade: 9.2, attendance: 98 },
                      { subject: 'Biologia', grade: 7.0, attendance: 85 }
                    ].map((item, index) => (
                      <div key={index} className="bg-background-secondary rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-text-primary">{item.subject}</span>
                          <div className="flex gap-4">
                            <span className={`text-sm ${getGradeColor(item.grade)}`}>Nota: {item.grade}</span>
                            <span className={`text-sm ${getAttendanceColor(item.attendance)}`}>Freq: {item.attendance}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <div className="w-full bg-secondary-light rounded-full h-2">
                              <div 
                                className="bg-primary-DEFAULT h-2 rounded-full" 
                                style={{ width: `${(item.grade / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-secondary-light rounded-full h-2">
                              <div 
                                className="bg-success-DEFAULT h-2 rounded-full" 
                                style={{ width: `${item.attendance}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-info-light/20 rounded-lg">
                  <h4 className="font-medium text-info-dark mb-2">Observações</h4>
                  <p className="text-sm text-info-dark">
                    O aluno apresenta bom desempenho geral, com destaque para Química. 
                    Recomenda-se atenção especial em Biologia para melhorar o aproveitamento.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'responsavel' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Dados do Responsável</h3>
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
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Responsável</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="guardian.name"
                        value={formData.guardian?.name || ''}
                        onChange={handleGuardianChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.guardian?.name || student.guardian?.name || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Grau de Parentesco</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="guardian.relationship"
                        value={formData.guardian?.relationship || ''}
                        onChange={handleGuardianChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.guardian?.relationship || student.guardian?.relationship || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Telefone</label>
                    {editMode ? (
                      <input
                        type="text"
                        name="guardian.phone"
                        value={formData.guardian?.phone || ''}
                        onChange={handleGuardianChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.guardian?.phone || student.guardian?.phone || 'Não informado'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                    {editMode ? (
                      <input
                        type="email"
                        name="guardian.email"
                        value={formData.guardian?.email || ''}
                        onChange={handleGuardianChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.guardian?.email || student.guardian?.email || 'Não informado'}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-warning-light/20 rounded-lg">
                  <h4 className="font-medium text-warning-dark mb-2">Importante</h4>
                  <p className="text-sm text-warning-dark">
                    Os dados do responsável são necessários para alunos menores de 18 anos ou quando 
                    solicitado pela instituição. Mantenha essas informações sempre atualizadas.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'historico' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Histórico do Aluno</h3>
                
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border-DEFAULT"></div>
                  <div className="space-y-6">
                    {[
                      { date: '15/01/2025', event: 'Aprovado em todas as disciplinas do 2º semestre', type: 'success' },
                      { date: '10/12/2024', event: 'Participou do projeto de extensão "Ciência para Todos"', type: 'achievement' },
                      { date: '25/11/2024', event: 'Recebeu advertência por atraso em 3 aulas seguidas', type: 'warning' },
                      { date: '15/08/2024', event: 'Início do 2º semestre letivo', type: 'info' },
                      { date: '01/03/2024', event: 'Matrícula realizada no curso', type: 'info' }
                    ].map((item, index) => (
                      <div key={index} className="relative flex items-start pl-10">
                        <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-background-primary flex items-center justify-center ${
                          item.type === 'success' ? 'bg-success-DEFAULT' :
                          item.type === 'achievement' ? 'bg-accent-purple-DEFAULT' :
                          item.type === 'warning' ? 'bg-warning-DEFAULT' :
                          'bg-info-DEFAULT'
                        } text-white`}>
                          {item.type === 'success' && '✓'}
                          {item.type === 'achievement' && '⭐'}
                          {item.type === 'warning' && '!'}
                          {item.type === 'info' && 'i'}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-text-primary">{item.date}</p>
                          <p className="text-sm text-text-secondary mt-1">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button className="text-primary-DEFAULT hover:text-primary-dark text-sm">
                    Ver histórico completo
                  </button>
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
                    Excluir Aluno
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
              Tem certeza que deseja excluir o aluno "{student.name}"? Esta ação não pode ser desfeita.
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