'use client'

import React, { useState, useEffect } from 'react';

interface ClassData {
  id: string;
  name: string;
  period: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
  status: 'Ativa' | 'Inativa' | 'Em Planejamento';
  teacher: string;
  teacherId?: string;
  maxStudents: number;
  currentStudents: number;
  averageGrade: number;
  attendanceRate: number;
  room?: string;
  schedule?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  subjects?: string[];
  level?: string;
  academicYear?: string;
}

interface ClassEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: ClassData | null;
  onSave: (data: ClassData) => void;
  isNew?: boolean;
}

export default function ClassEditModal({ 
  isOpen, 
  onClose, 
  classData, 
  onSave,
  isNew = false 
}: ClassEditModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState<Partial<ClassData>>({
    period: 'Manhã',
    status: 'Ativa',
    maxStudents: 35,
    currentStudents: 0,
    averageGrade: 0,
    attendanceRate: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (classData) {
      setFormData(classData);
    } else if (isNew) {
      setFormData({
        id: `class-${Date.now()}`,
        name: '',
        period: 'Manhã',
        status: 'Em Planejamento',
        teacher: '',
        maxStudents: 35,
        currentStudents: 0,
        averageGrade: 0,
        attendanceRate: 0,
        academicYear: new Date().getFullYear().toString(),
      });
    }
    setActiveTab('info');
    setErrors({});
  }, [classData, isNew]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome da turma é obrigatório';
    }
    
    if (!formData.teacher?.trim()) {
      newErrors.teacher = 'Professor responsável é obrigatório';
    }
    
    if (!formData.room?.trim()) {
      newErrors.room = 'Sala é obrigatória';
    }
    
    if (formData.currentStudents! > formData.maxStudents!) {
      newErrors.currentStudents = 'Número de alunos não pode exceder o máximo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData as ClassData);
      onClose();
    }
  };

  const handleDelete = () => {
    // TODO: Implement delete logic
    console.log('Deletando turma:', formData.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleSubjectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subjects = e.target.value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, subjects }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {isNew ? 'Nova Turma' : formData.name || 'Editar Turma'}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.status === 'Ativa' ? 'bg-green-500 text-white' :
                    formData.status === 'Inativa' ? 'bg-red-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {formData.status}
                  </span>
                  <span className="px-3 py-1 bg-blue-500 rounded-full text-sm">
                    {formData.period}
                  </span>
                  {!isNew && (
                    <span className="px-3 py-1 bg-blue-800 bg-opacity-50 rounded-full text-sm">
                      ID: {formData.id}
                    </span>
                  )}
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
                { id: 'students', label: 'Alunos', icon: '👥' },
                { id: 'schedule', label: 'Horários', icon: '📅' },
                { id: 'performance', label: 'Desempenho', icon: '📊' },
                { id: 'materials', label: 'Materiais', icon: '📚' }
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Turma *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Turma A - 3º Ano"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Período
                    </label>
                    <select
                      name="period"
                      value={formData.period || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Em Planejamento">Em Planejamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professor Responsável *
                    </label>
                    <input
                      type="text"
                      name="teacher"
                      value={formData.teacher || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.teacher ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nome do professor"
                    />
                    {errors.teacher && (
                      <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sala *
                    </label>
                    <input
                      type="text"
                      name="room"
                      value={formData.room || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.room ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Sala 101"
                    />
                    {errors.room && (
                      <p className="mt-1 text-sm text-red-600">{errors.room}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano Letivo
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número Máximo de Alunos
                    </label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={formData.maxStudents || 35}
                      onChange={handleNumberChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alunos Matriculados
                    </label>
                    <input
                      type="number"
                      name="currentStudents"
                      value={formData.currentStudents || 0}
                      onChange={handleNumberChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.currentStudents ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min="0"
                      max={formData.maxStudents}
                    />
                    {errors.currentStudents && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentStudents}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disciplinas (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      name="subjects"
                      value={formData.subjects?.join(', ') || ''}
                      onChange={handleSubjectsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Matemática, Português, História"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descrição adicional da turma..."
                    />
                  </div>
                </div>

                {/* Class Information Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3">Resumo da Turma</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ocupação</p>
                      <p className="text-lg font-semibold">
                        {formData.currentStudents}/{formData.maxStudents} alunos
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taxa de Ocupação</p>
                      <p className="text-lg font-semibold">
                        {((formData.currentStudents! / formData.maxStudents!) * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Média da Turma</p>
                      <p className="text-lg font-semibold">{formData.averageGrade?.toFixed(1) || '0.0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Frequência</p>
                      <p className="text-lg font-semibold">{formData.attendanceRate?.toFixed(0) || '0'}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Lista de Alunos</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Adicionar Aluno
                  </button>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Matrícula
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Média
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequência
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Sample student rows */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Ana Silva
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2025001
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          8.5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          95%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Ativo
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900">Detalhes</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-center text-gray-500 py-8">
                  <p>Nenhum aluno matriculado nesta turma ainda.</p>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Horários da Turma</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3">Grade Horária Semanal</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Horário</th>
                          <th className="border border-gray-300 px-4 py-2">Segunda</th>
                          <th className="border border-gray-300 px-4 py-2">Terça</th>
                          <th className="border border-gray-300 px-4 py-2">Quarta</th>
                          <th className="border border-gray-300 px-4 py-2">Quinta</th>
                          <th className="border border-gray-300 px-4 py-2">Sexta</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-medium">07:00 - 08:00</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Matemática</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Português</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Ciências</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">História</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Geografia</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-medium">08:00 - 09:00</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Matemática</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Português</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Ed. Física</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Inglês</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">Artes</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Desempenho da Turma</h3>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Média Geral</span>
                      <span className="text-2xl font-bold text-blue-600">7.9</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '79%' }}></div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Taxa de Aprovação</span>
                      <span className="text-2xl font-bold text-green-600">88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Frequência Média</span>
                      <span className="text-2xl font-bold text-yellow-600">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Participação</span>
                      <span className="text-2xl font-bold text-purple-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Performance by Subject */}
                <div className="mt-8">
                  <h4 className="font-medium text-gray-700 mb-4">Desempenho por Disciplina</h4>
                  <div className="space-y-3">
                    {['Matemática', 'Português', 'Ciências', 'História', 'Geografia'].map((subject) => (
                      <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{subject}</span>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {(Math.random() * 2 + 7).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Assessments */}
                <div className="mt-8">
                  <h4 className="font-medium text-gray-700 mb-4">Avaliações Recentes</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Avaliação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Média
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 text-sm">Prova de Matemática</td>
                          <td className="px-6 py-4 text-sm text-gray-500">15/05/2025</td>
                          <td className="px-6 py-4 text-sm">7.8</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Concluída
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm">Trabalho de História</td>
                          <td className="px-6 py-4 text-sm text-gray-500">20/05/2025</td>
                          <td className="px-6 py-4 text-sm">8.5</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Concluída
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Materiais Didáticos</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Adicionar Material
                  </button>
                </div>

                {/* Materials List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Apostila de Matemática</h5>
                          <p className="text-sm text-gray-500 mt-1">PDF • 2.5 MB</p>
                          <p className="text-xs text-gray-400 mt-1">Adicionado em 10/05/2025</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Vídeo Aula - Ciências</h5>
                          <p className="text-sm text-gray-500 mt-1">MP4 • 150 MB</p>
                          <p className="text-xs text-gray-400 mt-1">Adicionado em 12/05/2025</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2">Arraste arquivos aqui ou clique para adicionar</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {!isNew && activeTab === 'info' && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Excluir Turma
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isNew ? 'Criar Turma' : 'Salvar Alterações'}
                </button>
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
              Tem certeza que deseja excluir a turma "{formData.name}"? Esta ação não pode ser desfeita.
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