'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';

interface UnitDisplayData {
  id: string;
  name: string;
  institutionId: string;
  institutionName: string;
  location: string;
  status: 'Ativa' | 'Inativa' | 'Em Manutenção';
  imageUrl?: string;
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  type: 'Campus Principal' | 'Unidade' | 'Polo' | 'Extensão';
  address: string;
  phone?: string;
  email?: string;
  coordinator?: string;
}

interface UnitEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: UnitDisplayData | null;
}

export default function UnitEditModal({ isOpen, onClose, unit }: UnitEditModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UnitDisplayData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (unit) {
      setFormData(unit);
      setActiveTab('info');
      setEditMode(false);
    }
  }, [unit]);

  if (!isOpen || !unit) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Salvando dados da unidade:', formData);
    setEditMode(false);
    alert('Dados salvos com sucesso!');
  };

  const handleCancel = () => {
    setFormData(unit); // Reset to original unit data
    setEditMode(false);
  };

  const handleDelete = () => {
    console.log('Deletando unidade:', unit.id);
    setShowDeleteConfirm(false);
    onClose();
    alert('Unidade removida com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-success-DEFAULT text-white';
      case 'Inativa': return 'bg-error-DEFAULT text-white';
      case 'Em Manutenção': return 'bg-warning-DEFAULT text-text-primary'; // Assuming warning text is dark
      default: return 'bg-secondary-DEFAULT text-white';
    }
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
                  <h2 className="text-2xl font-bold">{formData.name || unit.name}</h2>
                  {editMode && (
                    <span className="px-2 py-1 bg-primary-dark/70 rounded text-xs">
                      Modo Edição
                    </span>
                  )}
                </div>
                <p className="text-primary-light/80 mb-3">{formData.institutionName || unit.institutionName}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status || unit.status)}`}>
                    {formData.status || unit.status}
                  </span>
                  <span className="px-3 py-1 bg-primary-light/30 rounded-full text-sm text-white">
                    {formData.type || unit.type}
                  </span>
                  <span className="px-3 py-1 bg-primary-dark/50 rounded-full text-sm text-white">
                    ID: {unit.id}
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
                { id: 'academico', label: 'Dados Acadêmicos', icon: '🎓' },
                { id: 'infraestrutura', label: 'Infraestrutura', icon: '🏢' },
                { id: 'contatos', label: 'Contatos', icon: '📞' },
                { id: 'historico', label: 'Histórico', icon: '📊' }
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
          <div className="p-6 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 280px)' }}> {/* Adjusted maxHeight */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Informações da Unidade</h3>
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
                  <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Unidade</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                    />
                  ) : (
                    <p className="text-text-primary py-2">{formData.name || unit.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Unidade</label>
                  {editMode ? (
                    <select
                      name="type"
                      value={formData.type || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                    >
                      <option value="Campus Principal">Campus Principal</option>
                      <option value="Unidade">Unidade</option>
                      <option value="Polo">Polo</option>
                      <option value="Extensão">Extensão</option>
                    </select>
                  ) : (
                    <p className="text-text-primary py-2">{formData.type || unit.type}</p>
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
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Em Manutenção">Em Manutenção</option>
                    </select>
                  ) : (
                    <p className="text-text-primary py-2">{formData.status || unit.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Localização</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                    />
                  ) : (
                    <p className="text-text-primary py-2">{formData.location || unit.location}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Endereço Completo</label>
                  {editMode ? (
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                    />
                  ) : (
                    <p className="text-text-primary py-2">{formData.address || unit.address}</p>
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
                    <p className="text-text-primary py-2">{formData.coordinator || unit.coordinator || 'Não definido'}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-background-secondary rounded-lg">
                <h4 className="font-medium text-text-primary mb-3">Informações Adicionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-text-secondary mb-1">CNPJ</p>
                    <p className="text-text-primary">12.345.678/0001-90</p> {/* Example static data */}
                  </div>
                  <div>
                    <p className="font-medium text-text-secondary mb-1">Inscrição Estadual</p>
                    <p className="text-text-primary">123.456.789.012</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-secondary mb-1">Data de Fundação</p>
                    <p className="text-text-primary">15/03/2010</p>
                  </div>
                  <div>
                    <p className="font-medium text-text-secondary mb-1">Alvará de Funcionamento</p>
                    <p className="text-text-primary">ALV-2010-0123</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academico' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Dados Acadêmicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary-light/10 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-primary-DEFAULT mb-2">{unit.studentCount}</div>
                  <div className="text-sm text-text-secondary">Alunos Matriculados</div>
                </div>
                <div className="bg-success-light/10 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-success-DEFAULT mb-2">{unit.teacherCount}</div>
                  <div className="text-sm text-text-secondary">Professores Ativos</div>
                </div>
                <div className="bg-accent-purple-light/10 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-accent-purple-DEFAULT mb-2">{unit.courseCount}</div>
                  <div className="text-sm text-text-secondary">Cursos Oferecidos</div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium text-text-primary mb-4">Distribuição por Nível de Ensino</h4>
                <div className="space-y-3">
                  {/* Example data - replace with actual data source */}
                  <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                    <span className="text-sm font-medium text-text-primary">Ensino Fundamental</span>
                    <span className="text-sm text-text-secondary">35%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                    <span className="text-sm font-medium text-text-primary">Ensino Médio</span>
                    <span className="text-sm text-text-secondary">40%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                    <span className="text-sm font-medium text-text-primary">Ensino Superior</span>
                    <span className="text-sm text-text-secondary">25%</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium text-text-primary mb-4">Indicadores de Desempenho</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background-secondary rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-text-primary">Taxa de Aprovação</span>
                      <span className="text-sm font-bold text-success-DEFAULT">92%</span>
                    </div>
                    <div className="w-full bg-secondary-light rounded-full h-2">
                      <div className="bg-success-DEFAULT h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="bg-background-secondary rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-text-primary">Taxa de Evasão</span>
                      <span className="text-sm font-bold text-error-DEFAULT">8%</span>
                    </div>
                    <div className="w-full bg-secondary-light rounded-full h-2">
                      <div className="bg-error-DEFAULT h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  <div className="bg-background-secondary rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-text-primary">Satisfação dos Alunos</span>
                      <span className="text-sm font-bold text-primary-DEFAULT">4.5/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= 4.5 ? 'text-accent-yellow-DEFAULT' : 'text-secondary-light'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="bg-background-secondary rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-text-primary">Frequência Média</span>
                      <span className="text-sm font-bold text-accent-purple-DEFAULT">87%</span>
                    </div>
                    <div className="w-full bg-secondary-light rounded-full h-2">
                      <div className="bg-accent-purple-DEFAULT h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'infraestrutura' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Infraestrutura</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-text-primary">Espaços Físicos</h4>
                  <div className="space-y-2">
                    {[{name: 'Salas de Aula', count: 24}, {name: 'Laboratórios', count: 8}, {name: 'Biblioteca', count: 1}, {name: 'Auditório', count: 2}].map(item => (
                      <div key={item.name} className="flex justify-between p-3 bg-background-secondary rounded-lg">
                        <span className="text-sm text-text-primary">{item.name}</span>
                        <span className="text-sm font-medium text-text-secondary">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-text-primary">Recursos Tecnológicos</h4>
                  <div className="space-y-2">
                     {[{name: 'Computadores', count: 150}, {name: 'Projetores', count: 30}, {name: 'Lousas Digitais', count: 12}, {name: 'Tablets', count: 50}].map(item => (
                      <div key={item.name} className="flex justify-between p-3 bg-background-secondary rounded-lg">
                        <span className="text-sm text-text-primary">{item.name}</span>
                        <span className="text-sm font-medium text-text-secondary">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-text-primary mb-3">Áreas Especiais</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Quadra Esportiva', 'Cantina', 'Área Verde', 'Estacionamento', 'Enfermaria', 'Sala de Professores', 'Secretaria', 'Coordenação'].map((area) => (
                    <div key={area} className="flex items-center p-2 bg-success-light/20 rounded-lg">
                      <svg className="w-4 h-4 text-success-DEFAULT mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-success-dark">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-text-primary mb-3">Cronograma de Manutenção</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-warning-light/20 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-warning-dark">Manutenção Elétrica</p>
                      <p className="text-xs text-text-secondary">Próxima: 15/06/2025</p>
                    </div>
                    <span className="px-2 py-1 bg-warning-DEFAULT text-white rounded text-xs">Agendada</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-success-light/20 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-success-dark">Limpeza Geral</p>
                      <p className="text-xs text-text-secondary">Última: 20/05/2025</p>
                    </div>
                    <span className="px-2 py-1 bg-success-DEFAULT text-white rounded text-xs">Concluída</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-info-light/20 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-info-dark">Atualização de Equipamentos</p>
                      <p className="text-xs text-text-secondary">Próxima: 01/07/2025</p>
                    </div>
                    <span className="px-2 py-1 bg-info-DEFAULT text-white rounded text-xs">Planejada</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contatos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Informações de Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Telefone Principal</label>
                  <p className="text-text-primary py-1">{formData.phone || unit.phone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">E-mail</label>
                  <p className="text-text-primary py-1">{formData.email || unit.email || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">WhatsApp</label>
                  <p className="text-text-primary py-1">{formData.phone || unit.phone || 'Não informado'}</p> {/* Assuming same as phone */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Horário de Funcionamento</label>
                  <p className="text-text-primary py-1">Segunda a Sexta: 07:00 - 22:00</p> {/* Example static data */}
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium text-text-primary mb-4">Contatos por Departamento</h4>
                <div className="space-y-3">
                  {/* Example static data */}
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-text-primary">Secretaria Acadêmica</p>
                        <p className="text-sm text-text-secondary mt-1">secretaria@unidade.edu.br</p>
                      </div>
                      <p className="text-sm text-text-secondary">(11) 1234-5678</p>
                    </div>
                  </div>
                  <div className="p-4 bg-background-secondary rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-text-primary">Coordenação Pedagógica</p>
                        <p className="text-sm text-text-secondary mt-1">coordenacao@unidade.edu.br</p>
                      </div>
                      <p className="text-sm text-text-secondary">(11) 1234-5679</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Histórico da Unidade</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border-DEFAULT -ml-px"></div> {/* Adjusted for icon alignment */}
                <div className="space-y-6">
                  {[
                    { date: '2025', event: 'Implementação do Sistema Digital de Ensino', type: 'technology' },
                    { date: '2024', event: 'Reforma completa da biblioteca', type: 'infrastructure' },
                    { date: '2023', event: 'Certificação ISO 9001:2015', type: 'achievement' },
                  ].map((item, index) => (
                    <div key={index} className="relative flex items-start pl-10"> {/* Added pl for icon space */}
                      <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 border-background-primary flex items-center justify-center ${
                        item.type === 'foundation' ? 'bg-primary-DEFAULT' :
                        item.type === 'achievement' ? 'bg-success-DEFAULT' :
                        item.type === 'infrastructure' ? 'bg-accent-purple-DEFAULT' :
                        item.type === 'technology' ? 'bg-accent-blue-DEFAULT' :
                        'bg-secondary-DEFAULT'
                      } text-white`}>
                        {/* Placeholder for icons based on type */}
                        <span className="text-sm">{item.type.substring(0,1).toUpperCase()}</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-text-primary">{item.date}</p>
                        <p className="text-sm text-text-secondary mt-1">{item.event}</p>
                      </div>
                    </div>
                  ))}
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
                    Excluir Unidade
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
                 {editMode && ( // Show save/cancel only in edit mode, regardless of tab
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
              Tem certeza que deseja excluir a unidade "{unit.name}"? Esta ação não pode ser desfeita.
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