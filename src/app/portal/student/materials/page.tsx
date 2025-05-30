'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Search,
  Filter,
  Calendar,
  ArrowLeft,
  Eye,
  Star,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'pdf' | 'video' | 'link' | 'document' | 'presentation';
  description: string;
  uploadDate: string;
  teacherName: string;
  fileSize?: string;
  duration?: string;
  downloads: number;
  rating: number;
  tags: string[];
  isNew: boolean;
  isFavorite: boolean;
}

export default function AllStudyMaterialsPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'downloads' | 'rating'>('date');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      
      // Dados simulados
      const mockMaterials: StudyMaterial[] = [
        {
          id: '1',
          title: 'Apostila de Matemática - Frações',
          subject: 'Matemática',
          type: 'pdf',
          description: 'Material completo sobre frações, operações e exercícios práticos',
          uploadDate: '2025-01-28',
          teacherName: 'Prof. Maria Santos',
          fileSize: '2.5 MB',
          downloads: 45,
          rating: 4.8,
          tags: ['frações', 'operações', 'exercícios'],
          isNew: true,
          isFavorite: false
        },
        {
          id: '2',
          title: 'Vídeo Aula - Verbos em Português',
          subject: 'Português',
          type: 'video',
          description: 'Explicação detalhada sobre conjugação verbal e tempos verbais',
          uploadDate: '2025-01-27',
          teacherName: 'Prof. Ana Lima',
          duration: '25 min',
          downloads: 32,
          rating: 4.6,
          tags: ['verbos', 'conjugação', 'gramática'],
          isNew: true,
          isFavorite: true
        },
        {
          id: '3',
          title: 'Exercícios Complementares - Sistema Solar',
          subject: 'Ciências',
          type: 'document',
          description: 'Lista de exercícios sobre planetas e características do sistema solar',
          uploadDate: '2025-01-26',
          teacherName: 'Prof. Carlos Silva',
          fileSize: '1.8 MB',
          downloads: 28,
          rating: 4.5,
          tags: ['planetas', 'astronomia', 'exercícios'],
          isNew: false,
          isFavorite: false
        },
        {
          id: '4',
          title: 'Apresentação - História do Brasil Colonial',
          subject: 'História',
          type: 'presentation',
          description: 'Slides sobre o período colonial brasileiro com imagens e mapas',
          uploadDate: '2025-01-25',
          teacherName: 'Prof. Roberto Oliveira',
          fileSize: '15.2 MB',
          downloads: 67,
          rating: 4.9,
          tags: ['brasil colonial', 'história', 'período colonial'],
          isNew: false,
          isFavorite: true
        },
        {
          id: '5',
          title: 'Simulado de Física - Mecânica',
          subject: 'Física',
          type: 'pdf',
          description: 'Questões de vestibular sobre mecânica clássica com gabarito',
          uploadDate: '2025-01-24',
          teacherName: 'Prof. João Ferreira',
          fileSize: '3.1 MB',
          downloads: 89,
          rating: 4.7,
          tags: ['mecânica', 'vestibular', 'simulado'],
          isNew: false,
          isFavorite: false
        },
        {
          id: '6',
          title: 'Tutorial - Experimentos de Química',
          subject: 'Química',
          type: 'video',
          description: 'Demonstração de experimentos básicos de química orgânica',
          uploadDate: '2025-01-23',
          teacherName: 'Prof. Lucia Mendes',
          duration: '18 min',
          downloads: 41,
          rating: 4.4,
          tags: ['experimentos', 'química orgânica', 'laboratório'],
          isNew: false,
          isFavorite: false
        }
      ];

      setMaterials(mockMaterials);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'presentation':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'link':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeText = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'video':
        return 'Vídeo';
      case 'document':
        return 'Documento';
      case 'presentation':
        return 'Apresentação';
      case 'link':
        return 'Link';
      default:
        return 'Arquivo';
    }
  };

  const getTypeColor = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'video':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'document':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'presentation':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'link':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredMaterials = materials
    .filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || material.type === typeFilter;
      const matchesSubject = subjectFilter === 'all' || material.subject === subjectFilter;
      
      return matchesSearch && matchesType && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const subjects = Array.from(new Set(materials.map(m => m.subject)));
  const types = Array.from(new Set(materials.map(m => m.type)));

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
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Todos os Materiais de Estudo
        </h1>
        <p className="text-gray-600">
          Acesse todos os materiais disponibilizados pelos seus professores
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Materiais</p>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Novos esta Semana</p>
              <p className="text-2xl font-bold text-green-600">{materials.filter(m => m.isNew).length}</p>
            </div>
            <Star className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Favoritos</p>
              <p className="text-2xl font-bold text-yellow-600">{materials.filter(m => m.isFavorite).length}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-blue-600">{materials.reduce((sum, m) => sum + m.downloads, 0)}</p>
            </div>
            <Download className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar materiais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos os Tipos</option>
            {types.map(type => (
              <option key={type} value={type}>{getTypeText(type)}</option>
            ))}
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todas as Matérias</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'downloads' | 'rating')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="date">Mais Recentes</option>
            <option value="name">Nome A-Z</option>
            <option value="downloads">Mais Baixados</option>
            <option value="rating">Melhor Avaliados</option>
          </select>
        </div>
      </div>

      {/* Lista de Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum material encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'all' || subjectFilter !== 'all'
                ? 'Tente ajustar os filtros para encontrar materiais.'
                : 'Não há materiais disponíveis no momento.'}
            </p>
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(material.type)}
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(material.type)}`}>
                      {getTypeText(material.type)}
                    </span>
                    {material.isNew && (
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Novo
                      </span>
                    )}
                  </div>
                </div>
                <button className={`p-1 rounded ${material.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}>
                  <Star className="w-5 h-5" fill={material.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{material.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{material.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span className="font-medium text-primary">{material.subject}</span>
                <span>•</span>
                <span>Prof. {material.teacherName}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(material.uploadDate).toLocaleDateString('pt-BR')}</span>
                </div>
                {material.fileSize && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{material.fileSize}</span>
                  </div>
                )}
                {material.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{material.duration}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(material.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{material.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Download className="w-4 h-4" />
                  <span>{material.downloads}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {material.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  <Download className="w-4 h-4" />
                  Baixar
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="w-4 h-4" />
                  Visualizar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 