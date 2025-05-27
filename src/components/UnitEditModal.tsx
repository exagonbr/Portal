'use client'

import React, { useState, useEffect } from 'react';

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
    // TODO: Implement save logic
    console.log('Salvando dados da unidade:', formData);
    setEditMode(false);
    // Show success message
    alert('Dados salvos com sucesso!');
  };

  const handleCancel = () => {
    setFormData(unit);
    setEditMode(false);
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log('Deletando unidade:', unit.id);
    setShowDeleteConfirm(false);
    onClose();
    alert('Unidade removida com sucesso!');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{unit.name}</h2>
                  {editMode && (
                    <span className="px-2 py-1 bg-blue-800 bg-opacity-50 rounded text-xs">
                      Modo Edição
                    </span>
                  )}
                </div>
                <p className="text-blue-100 mb-3">{unit.institutionName}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    unit.status === 'Ativa' ? 'bg-green-500 text-white' :
                    unit.status === 'Inativa' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {unit.status}
                  </span>
                  <span className="px-3 py-1 bg-blue-500 rounded-full text-sm">
                    {unit.type}
                  </span>
                  <span className="px-3 py-1 bg-blue-800 bg-opacity-50 rounded-full text-sm">
                    ID: {unit.id}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
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
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Informações da Unidade</h3>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Editar
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Unidade</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{unit.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Unidade</label>
                  {editMode ? (
                    <select
                      name="type"
                      value={formData.type || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Campus Principal">Campus Principal</option>
                      <option value="Unidade">Unidade</option>
                      <option value="Polo">Polo</option>
                      <option value="Extensão">Extensão</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{unit.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  {editMode ? (
                    <select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Em Manutenção">Em Manutenção</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{unit.status}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{unit.location}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço Completo</label>
                  {editMode ? (
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{unit.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coordenador</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="coordinator"
                      value={formData.coordinator || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{unit.coordinator || 'Não definido'}</p>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Informações Adicionais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <p className="text-gray-900">12.345.678/0001-90</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual</label>
                    <p className="text-gray-900">123.456.789.012</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fundação</label>
                    <p className="text-gray-900">15/03/2010</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alvará de Funcionamento</label>
                    <p className="text-gray-900">ALV-2010-0123</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academico' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Dados Acadêmicos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{unit.studentCount}</div>
                  <div className="text-sm text-gray-600">Alunos Matriculados</div>
                </div>
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{unit.teacherCount}</div>
                  <div className="text-sm text-gray-600">Professores Ativos</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{unit.courseCount}</div>
                  <div className="text-sm text-gray-600">Cursos Oferecidos</div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-4">Distribuição por Nível de Ensino</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Ensino Fundamental</span>
                    <span className="text-sm text-gray-600">35%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Ensino Médio</span>
                    <span className="text-sm text-gray-600">40%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Ensino Superior</span>
                    <span className="text-sm text-gray-600">25%</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-4">Indicadores de Desempenho</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Taxa de Aprovação</span>
                      <span className="text-sm font-bold text-green-600">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Taxa de Evasão</span>
                      <span className="text-sm font-bold text-red-600">8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Satisfação dos Alunos</span>
                      <span className="text-sm font-bold text-blue-600">4.5/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= 4.5 ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Frequência Média</span>
                      <span className="text-sm font-bold text-purple-600">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'infraestrutura' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Infraestrutura</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Espaços Físicos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Salas de Aula</span>
                      <span className="text-sm font-medium">24</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Laboratórios</span>
                      <span className="text-sm font-medium">8</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Biblioteca</span>
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Auditório</span>
                      <span className="text-sm font-medium">2</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Recursos Tecnológicos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Computadores</span>
                      <span className="text-sm font-medium">150</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Projetores</span>
                      <span className="text-sm font-medium">30</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Lousas Digitais</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Tablets</span>
                      <span className="text-sm font-medium">50</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">Áreas Especiais</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Quadra Esportiva', 'Cantina', 'Área Verde', 'Estacionamento', 'Enfermaria', 'Sala de Professores', 'Secretaria', 'Coordenação'].map((area) => (
                    <div key={area} className="flex items-center p-2 bg-green-50 rounded-lg">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Schedule */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">Cronograma de Manutenção</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Manutenção Elétrica</p>
                      <p className="text-xs text-gray-600">Próxima: 15/06/2025</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">Agendada</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Limpeza Geral</p>
                      <p className="text-xs text-gray-600">Última: 20/05/2025</p>
                    </div>
                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Concluída</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Atualização de Equipamentos</p>
                      <p className="text-xs text-gray-600">Próxima: 01/07/2025</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Planejada</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contatos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone Principal</label>
                  <p className="text-gray-900">{unit.phone || 'Não informado'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <p className="text-gray-900">{unit.email || 'Não informado'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <p className="text-gray-900">{unit.phone || 'Não informado'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Funcionamento</label>
                  <p className="text-gray-900">Segunda a Sexta: 07:00 - 22:00</p>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-4">Contatos por Departamento</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Secretaria Acadêmica</p>
                        <p className="text-sm text-gray-600 mt-1">secretaria@unidade.edu.br</p>
                      </div>
                      <p className="text-sm text-gray-600">(11) 1234-5678</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Coordenação Pedagógica</p>
                        <p className="text-sm text-gray-600 mt-1">coordenacao@unidade.edu.br</p>
                      </div>
                      <p className="text-sm text-gray-600">(11) 1234-5679</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Suporte Técnico</p>
                        <p className="text-sm text-gray-600 mt-1">suporte@unidade.edu.br</p>
                      </div>
                      <p className="text-sm text-gray-600">(11) 1234-5680</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-4">Redes Sociais</h4>
                <div className="flex gap-4">
                  <a href="#" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a href="#" className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                    Instagram
                  </a>
                  <a href="#" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Histórico da Unidade</h3>
              
              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                <div className="space-y-6">
                  {[
                    { date: '2025', event: 'Implementação do Sistema Digital de Ensino', type: 'technology' },
                    { date: '2024', event: 'Reforma completa da biblioteca', type: 'infrastructure' },
                    { date: '2023', event: 'Certificação ISO 9001:2015', type: 'achievement' },
                    { date: '2022', event: 'Inauguração do novo laboratório de ciências', type: 'infrastructure' },
                    { date: '2020', event: 'Adaptação para ensino híbrido (COVID-19)', type: 'adaptation' },
                    { date: '2018', event: 'Expansão com novo bloco de salas', type: 'expansion' },
                    { date: '2015', event: 'Implementação do programa bilíngue', type: 'academic' },
                    { date: '2010', event: 'Fundação da unidade', type: 'foundation' }
                  ].map((item, index) => (
                    <div key={index} className="relative flex items-start">
                      <div className={`absolute left-6 w-4 h-4 rounded-full border-2 border-white ${
                        item.type === 'foundation' ? 'bg-blue-600' :
                        item.type === 'achievement' ? 'bg-green-600' :
                        item.type === 'infrastructure' ? 'bg-purple-600' :
                        item.type === 'technology' ? 'bg-indigo-600' :
                        item.type === 'expansion' ? 'bg-yellow-600' :
                        item.type === 'academic' ? 'bg-pink-600' :
                        'bg-gray-600'
                      }`}></div>
                      <div className="ml-16">
                        <p className="text-sm font-medium text-gray-900">{item.date}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Achievements */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-4">Principais Conquistas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        1º
                      </div>
                      <div>
                        <p className="font-medium">Melhor Unidade Regional</p>
                        <p className="text-sm text-gray-600">Prêmio Educação 2024</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Certificação Ambiental</p>
                        <p className="text-sm text-gray-600">Escola Sustentável 2023</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-500">
                  Última atualização: {new Date().toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {!editMode && activeTab === 'info' && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Excluir Unidade
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
                {activeTab === 'info' && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar Informações
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a unidade "{unit.name}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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