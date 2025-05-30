'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Search,
  Calendar,
  Clock,
  UserCheck,
  GraduationCap,
  CheckCircle,
  XCircle,
  School,
  BookOpen
} from 'lucide-react';
import { classService } from '@/services/classService';
import { schoolService } from '@/services/schoolService';
import { Class, CreateClassData, UpdateClassData, SHIFT_LABELS } from '@/types/class';
import { School as SchoolType } from '@/types/school';
import { useAuth } from '@/contexts/AuthContext';

export default function ClassesManagement() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    code: '',
    school_id: '',
    year: new Date().getFullYear(),
    shift: 'MORNING',
    max_students: 30
  });

  useEffect(() => {
    loadData();
  }, [selectedSchool, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar escolas
      const schoolsResponse = await schoolService.list({ limit: 100 });
      setSchools(schoolsResponse.data || []);

      // Carregar turmas
      const filter: any = { year: selectedYear, limit: 100 };
      if (selectedSchool) {
        filter.school_id = selectedSchool;
      }
      
      const response = await classService.list(filter);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClass) {
        const updated = await classService.update(editingClass.id, formData as UpdateClassData);
        setClasses(classes.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await classService.create(formData);
        setClasses([...classes, created]);
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar turma:', error);
      alert(error.response?.data?.message || 'Erro ao salvar turma');
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      code: classItem.code,
      school_id: classItem.school_id,
      year: classItem.year,
      shift: classItem.shift,
      max_students: classItem.max_students
    });
    setShowModal(true);
  };

  const handleToggleActive = async (classItem: Class) => {
    try {
      if (classItem.is_active) {
        await classService.deactivate(classItem.id);
      } else {
        await classService.activate(classItem.id);
      }
      loadData();
    } catch (error) {
      console.error('Erro ao alterar status da turma:', error);
    }
  };

  const resetForm = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      code: '',
      school_id: '',
      year: new Date().getFullYear(),
      shift: 'MORNING',
      max_students: 30
    });
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Escola não encontrada';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary text-gray-800 mb-2">
          Gestão de Turmas
        </h1>
        <p className="text-gray-600 text-gray-400">
          Gerencie as turmas das escolas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white bg-gray-300 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Turmas</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-white bg-gray-300 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Turmas Ativas</p>
              <p className="text-2xl font-bold">
                {classes.filter(c => c.is_active).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-accent-green" />
          </div>
        </div>

        <div className="bg-white bg-gray-300 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Capacidade Total</p>
              <p className="text-2xl font-bold">
                {classes.reduce((sum, c) => sum + c.max_students, 0)}
              </p>
            </div>
            <GraduationCap className="w-8 h-8 text-accent-purple" />
          </div>
        </div>

        <div className="bg-white bg-gray-300 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Escolas</p>
              <p className="text-2xl font-bold">{schools.length}</p>
            </div>
            <School className="w-8 h-8 text-accent-orange" />
          </div>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="bg-white bg-gray-300 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
              />
            </div>
          </div>
          
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-4 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
          >
            <option value="">Todas as escolas</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
          >
            {[2023, 2024, 2025, 2026].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary text-gray-800 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Turma
          </button>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white bg-gray-300 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-primary text-gray-800">
                  {classItem.name}
                </h3>
                <p className="text-sm text-gray-500">Código: {classItem.code}</p>
                <p className="text-sm text-gray-600 text-gray-400 mt-1">
                  {getSchoolName(classItem.school_id)}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                classItem.is_active
                  ? 'bg-accent-green/20 text-accent-green bg-accent-green/30 text-accent-green'
                  : 'bg-error/20 text-error bg-error/30 text-error'
              }`}>
                {classItem.is_active ? 'Ativa' : 'Inativa'}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                Ano: {classItem.year}
              </div>
              <div className="flex items-center text-sm text-gray-600 text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                Turno: {SHIFT_LABELS[classItem.shift]}
              </div>
              <div className="flex items-center text-sm text-gray-600 text-gray-400">
                <UserCheck className="w-4 h-4 mr-2" />
                Capacidade: {classItem.max_students} alunos
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <button
                onClick={() => handleEdit(classItem)}
                className="text-primary hover:text-primary-dark text-primary-light hover:text-primary transition-colors flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleToggleActive(classItem)}
                className={`flex items-center gap-1 ${
                  classItem.is_active
                    ? 'text-error hover:text-error/80 text-error hover:text-error/80'
                    : 'text-accent-green hover:text-accent-green/80 text-accent-green hover:text-accent-green/80'
                }`}
              >
                {classItem.is_active ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Desativar
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Ativar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Formulário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-gray-300 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {editingClass ? 'Editar Turma' : 'Nova Turma'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nome da Turma *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Escola *
                  </label>
                  <select
                    value={formData.school_id}
                    onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
                    required
                  >
                    <option value="">Selecione uma escola</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ano *
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
                      required
                      min="2020"
                      max="2030"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Turno *
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
                      required
                    >
                      {Object.entries(SHIFT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Capacidade Máxima *
                  </label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-100"
                    required
                    min="1"
                    max="100"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 text-gray-300 hover:bg-gray-100 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-gray-800 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {editingClass ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
