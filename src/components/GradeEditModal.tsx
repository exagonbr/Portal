'use client'

import React, { useState, useEffect } from 'react';

interface GradeDisplayData {
  id: string;
  studentId: string;
  studentName: string;
  studentRegistration: string;
  courseId: string;
  courseName: string;
  subject: string;
  evaluationType: 'Prova' | 'Trabalho' | 'Seminário' | 'Participação' | 'Projeto';
  grade: number;
  maxGrade: number;
  weight: number;
  date: string;
  semester: string;
  status: 'Lançada' | 'Pendente' | 'Revisão';
  comments?: string;
  teacherId: string;
  teacherName: string;
}

interface GradeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: GradeDisplayData | null;
}

export default function GradeEditModal({ isOpen, onClose, grade }: GradeEditModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<GradeDisplayData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (grade) {
      setFormData(grade);
      setActiveTab('info');
      setEditMode(false);
    }
  }, [grade]);

  if (!isOpen || !grade) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= (formData.maxGrade || 10)) {
      setFormData(prev => ({ ...prev, grade: value }));
    }
  };

  const handleSave = () => {
    console.log('Salvando nota:', formData);
    setEditMode(false);
    alert('Nota salva com sucesso!');
  };

  const handleCancel = () => {
    setFormData(grade);
    setEditMode(false);
  };

  const handleDelete = () => {
    console.log('Deletando nota:', grade.id);
    setShowDeleteConfirm(false);
    onClose();
    alert('Nota removida com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lançada': return 'bg-success-DEFAULT text-white';
      case 'Pendente': return 'bg-warning-DEFAULT text-text-primary';
      case 'Revisão': return 'bg-info-DEFAULT text-white';
      default: return 'bg-secondary-DEFAULT text-white';
    }
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 70) return 'text-success-DEFAULT';
    if (percentage >= 50) return 'text-warning-DEFAULT';
    return 'text-error-DEFAULT';
  };

  const calculatePercentage = () => {
    if (!formData.grade || !formData.maxGrade) return 0;
    return ((formData.grade / formData.maxGrade) * 100).toFixed(1);
  };

  const calculateWeightedGrade = () => {
    if (!formData.grade || !formData.maxGrade || !formData.weight) return 0;
    return ((formData.grade / formData.maxGrade) * formData.weight).toFixed(2);
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
                  <h2 className="text-2xl font-bold">Editar Nota</h2>
                  {editMode && (
                    <span className="px-2 py-1 bg-primary-dark/70 rounded text-xs">
                      Modo Edição
                    </span>
                  )}
                </div>
                <p className="text-primary-light/80 mb-3">{formData.studentName || grade.studentName}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status || grade.status)}`}>
                    {formData.status || grade.status}
                  </span>
                  <span className="px-3 py-1 bg-primary-light/30 rounded-full text-sm text-white">
                    {formData.evaluationType || grade.evaluationType}
                  </span>
                  <span className="px-3 py-1 bg-primary-dark/50 rounded-full text-sm text-white">
                    {formData.subject || grade.subject}
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
                { id: 'info', label: 'Informações da Nota', icon: '📝' },
                { id: 'historico', label: 'Histórico', icon: '📊' },
                { id: 'estatisticas', label: 'Estatísticas', icon: '📈' }
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
                  <h3 className="text-lg font-semibold text-text-primary">Detalhes da Avaliação</h3>
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

                {/* Grade Display */}
                <div className="bg-background-secondary rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                      <span className={getGradeColor(formData.grade || grade.grade, formData.maxGrade || grade.maxGrade)}>
                        {formData.grade || grade.grade}
                      </span>
                      <span className="text-2xl text-text-secondary">/{formData.maxGrade || grade.maxGrade}</span>
                    </div>
                    <div className="text-lg text-text-secondary mb-1">{calculatePercentage()}%</div>
                    <div className="text-sm text-text-tertiary">
                      Peso: {formData.weight || grade.weight}% | Contribuição: {calculateWeightedGrade()} pontos
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Aluno</label>
                    <p className="text-text-primary py-2">{formData.studentName || grade.studentName}</p>
                    <p className="text-sm text-text-secondary">Matrícula: {formData.studentRegistration || grade.studentRegistration}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Curso</label>
                    <p className="text-text-primary py-2">{formData.courseName || grade.courseName}</p>
                    <p className="text-sm text-text-secondary">Disciplina: {formData.subject || grade.subject}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Avaliação</label>
                    {editMode ? (
                      <select
                        name="evaluationType"
                        value={formData.evaluationType || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      >
                        <option value="Prova">Prova</option>
                        <option value="Trabalho">Trabalho</option>
                        <option value="Seminário">Seminário</option>
                        <option value="Participação">Participação</option>
                        <option value="Projeto">Projeto</option>
                      </select>
                    ) : (
                      <p className="text-text-primary py-2">{formData.evaluationType || grade.evaluationType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data da Avaliação</label>
                    {editMode ? (
                      <input
                        type="date"
                        name="date"
                        value={formData.date || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{new Date(formData.date || grade.date).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Nota</label>
                    {editMode ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="grade"
                          value={formData.grade || ''}
                          onChange={handleGradeChange}
                          min="0"
                          max={formData.maxGrade || grade.maxGrade}
                          step="0.1"
                          className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                        />
                        <span className="text-text-secondary">/ {formData.maxGrade || grade.maxGrade}</span>
                      </div>
                    ) : (
                      <p className="text-text-primary py-2">{formData.grade || grade.grade} / {formData.maxGrade || grade.maxGrade}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Peso (%)</label>
                    {editMode ? (
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight || ''}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.weight || grade.weight}%</p>
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
                        <option value="Lançada">Lançada</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Revisão">Revisão</option>
                      </select>
                    ) : (
                      <p className="text-text-primary py-2">{formData.status || grade.status}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Semestre</label>
                    <p className="text-text-primary py-2">{formData.semester || grade.semester}</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Observações</label>
                    {editMode ? (
                      <textarea
                        name="comments"
                        value={formData.comments || ''}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                        placeholder="Adicione observações sobre esta avaliação..."
                      />
                    ) : (
                      <p className="text-text-primary py-2">{formData.comments || grade.comments || 'Nenhuma observação'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'historico' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Histórico de Alterações</h3>
                
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border-DEFAULT"></div>
                  <div className="space-y-6">
                    {[
                      { date: '15/01/2025 10:30', action: 'Nota alterada de 7.5 para 8.0', user: grade.teacherName, type: 'edit' },
                      { date: '14/01/2025 15:45', action: 'Status alterado para "Em Revisão"', user: grade.teacherName, type: 'status' },
                      { date: '13/01/2025 09:00', action: 'Observações adicionadas', user: grade.teacherName, type: 'comment' },
                      { date: '10/01/2025 14:20', action: 'Nota lançada: 7.5', user: grade.teacherName, type: 'create' }
                    ].map((item, index) => (
                      <div key={index} className="relative flex items-start pl-10">
                        <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-background-primary flex items-center justify-center ${
                          item.type === 'edit' ? 'bg-info-DEFAULT' :
                          item.type === 'status' ? 'bg-warning-DEFAULT' :
                          item.type === 'comment' ? 'bg-accent-purple-DEFAULT' :
                          'bg-success-DEFAULT'
                        } text-white`}>
                          {item.type === 'edit' && '✏️'}
                          {item.type === 'status' && '🔄'}
                          {item.type === 'comment' && '💬'}
                          {item.type === 'create' && '➕'}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-text-primary">{item.date}</p>
                          <p className="text-sm text-text-secondary">{item.action}</p>
                          <p className="text-xs text-text-tertiary mt-1">Por: {item.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-info-light/20 rounded-lg">
                  <p className="text-info-dark text-sm">
                    <strong>Informação:</strong> Todas as alterações são registradas automaticamente 
                    e podem ser auditadas pela coordenação.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'estatisticas' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Estatísticas e Comparações</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary-light/10 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-primary-DEFAULT mb-2">
                      {calculatePercentage()}%
                    </div>
                    <div className="text-sm text-text-secondary">Aproveitamento</div>
                  </div>
                  <div className="bg-success-light/10 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-success-DEFAULT mb-2">7.2</div>
                    <div className="text-sm text-text-secondary">Média da Turma</div>
                  </div>
                  <div className="bg-accent-purple-light/10 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-accent-purple-DEFAULT mb-2">12°</div>
                    <div className="text-sm text-text-secondary">Posição na Turma</div>
                  </div>
                </div>

                <div className="bg-background-secondary rounded-lg p-6">
                  <h4 className="font-medium text-text-primary mb-4">Comparação com a Turma</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Nota do Aluno</span>
                        <span className="text-text-primary font-medium">{formData.grade || grade.grade}</span>
                      </div>
                      <div className="w-full bg-secondary-light rounded-full h-2">
                        <div 
                          className="bg-primary-DEFAULT h-2 rounded-full" 
                          style={{ width: `${calculatePercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Média da Turma</span>
                        <span className="text-text-primary font-medium">7.2</span>
                      </div>
                      <div className="w-full bg-secondary-light rounded-full h-2">
                        <div 
                          className="bg-success-DEFAULT h-2 rounded-full" 
                          style={{ width: '72%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Maior Nota</span>
                        <span className="text-text-primary font-medium">9.8</span>
                      </div>
                      <div className="w-full bg-secondary-light rounded-full h-2">
                        <div 
                          className="bg-accent-purple-DEFAULT h-2 rounded-full" 
                          style={{ width: '98%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">Menor Nota</span>
                        <span className="text-text-primary font-medium">4.5</span>
                      </div>
                      <div className="w-full bg-secondary-light rounded-full h-2">
                        <div 
                          className="bg-error-DEFAULT h-2 rounded-full" 
                          style={{ width: '45%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background-secondary rounded-lg p-4">
                    <h4 className="font-medium text-text-primary mb-2">Distribuição de Notas</h4>
                    <div className="text-sm text-text-secondary">
                      <p>A-B (8-10): 35% dos alunos</p>
                      <p>C (6-7.9): 45% dos alunos</p>
                      <p>D-F (0-5.9): 20% dos alunos</p>
                    </div>
                  </div>
                  <div className="bg-background-secondary rounded-lg p-4">
                    <h4 className="font-medium text-text-primary mb-2">Informações Adicionais</h4>
                    <div className="text-sm text-text-secondary">
                      <p>Total de Alunos: 45</p>
                      <p>Avaliações Lançadas: 42</p>
                      <p>Em Revisão: 3</p>
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
                    Excluir Nota
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
                    Editar Nota
                  </button>
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
            <p className="text-text-secondary mb-4">
              Tem certeza que deseja excluir esta nota?
            </p>
            <p className="text-warning-DEFAULT text-sm mb-6">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita e afetará o cálculo 
              da média final do aluno.
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