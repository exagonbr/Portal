'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_SEARCH_RESULTS = [
  {
    id: 1,
    title: 'Matemática Básica - 6º Ano',
    type: 'Livro Digital',
    author: 'Prof. João Silva',
    subject: 'Matemática',
    grade: '6º Ano',
    description: 'Livro completo de matemática para o ensino fundamental',
    tags: ['matemática', 'fundamental', 'números'],
    dateCreated: '2024-01-15',
    downloads: 245,
    rating: 4.8,
    size: '15.2 MB'
  },
  {
    id: 2,
    title: 'História do Brasil Colonial',
    type: 'Vídeo Aula',
    author: 'Profa. Maria Santos',
    subject: 'História',
    grade: '7º Ano',
    description: 'Série de vídeos sobre o período colonial brasileiro',
    tags: ['história', 'brasil', 'colonial'],
    dateCreated: '2024-02-10',
    downloads: 189,
    rating: 4.6,
    size: '2.1 GB'
  },
  {
    id: 3,
    title: 'Experimentos de Química',
    type: 'Material Interativo',
    author: 'Prof. Carlos Lima',
    subject: 'Química',
    grade: 'Ensino Médio',
    description: 'Simulações interativas de experimentos químicos',
    tags: ['química', 'experimentos', 'simulação'],
    dateCreated: '2024-03-05',
    downloads: 156,
    rating: 4.9,
    size: '45.8 MB'
  }
]

const CONTENT_TYPES = ['Todos', 'Livro Digital', 'Vídeo Aula', 'Material Interativo', 'Exercícios', 'Avaliação']
const SUBJECTS = ['Todas', 'Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Física', 'Química', 'Biologia']
const GRADES = ['Todos', 'Ensino Fundamental I', 'Ensino Fundamental II', 'Ensino Médio']

export default function AdminContentSearchPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [contentType, setContentType] = useState('Todos')
  const [subject, setSubject] = useState('Todas')
  const [grade, setGrade] = useState('Todos')
  const [sortBy, setSortBy] = useState('relevance')
  const [results, setResults] = useState(MOCK_SEARCH_RESULTS)

  const handleSearch = () => {
    // Simular busca
    console.log('Searching for:', { searchTerm, contentType, subject, grade, sortBy })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Busca de Conteúdo</h1>
        <p className="text-gray-600">Encontre materiais educacionais na biblioteca digital</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Termo de Busca</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="Digite palavras-chave..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conteúdo</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {CONTENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {SUBJECTS.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {GRADES.map(gr => (
                <option key={gr} value={gr}>{gr}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              <option value="relevance">Relevância</option>
              <option value="date">Data</option>
              <option value="downloads">Downloads</option>
              <option value="rating">Avaliação</option>
            </select>
          </div>
          
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors duration-200"
          >
            <span className="material-symbols-outlined">search</span>
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">{results.length} resultados encontrados</p>
        <div className="flex space-x-2">
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span className="material-symbols-outlined">view_list</span>
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-primary/10 border-primary/30">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.author}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'Livro Digital' ? 'bg-primary/10 text-primary' :
                    item.type === 'Vídeo Aula' ? 'bg-error/20 text-error' :
                    'bg-accent-green/20 text-accent-green'
                  }`}>
                    {item.type}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {item.subject}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-yellow-500">
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="text-sm font-medium">{item.rating}</span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>{item.downloads} downloads</span>
              <span>{item.size}</span>
              <span>{new Date(item.dateCreated).toLocaleDateString('pt-BR')}</span>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark text-sm transition-colors duration-200">
                Visualizar
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <span className="material-symbols-outlined text-sm">share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}