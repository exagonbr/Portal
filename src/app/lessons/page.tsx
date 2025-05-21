'use client'

import { useState } from 'react'

interface Aula {
  id: string
  titulo: string
  professor: string
  disciplina: string
  estagio: string
  ciclo: string
  nota?: number
  status: 'pendente' | 'em_andamento' | 'concluida'
  dataEntrega?: string
  progresso: number
  descricao: string
}

export default function Lessons() {
  const [selectedEstagio, setSelectedEstagio] = useState('todos')
  const [selectedCiclo, setSelectedCiclo] = useState('todos')
  const [selectedDisciplina, setSelectedDisciplina] = useState('todas')

  const aulas: Aula[] = [
    {
      id: '1',
      titulo: 'Introdução à Álgebra Linear',
      professor: 'Profa. Maria Silva',
      disciplina: 'Matemática',
      estagio: 'Estágio 2',
      ciclo: 'Ciclo 1',
      nota: 8.5,
      status: 'concluida',
      progresso: 100,
      descricao: 'Fundamentos de álgebra linear e suas aplicações.'
    },
    {
      id: '2',
      titulo: 'Mecânica Quântica',
      professor: 'Prof. João Santos',
      disciplina: 'Física',
      estagio: 'Estágio 3',
      ciclo: 'Ciclo 2',
      status: 'em_andamento',
      dataEntrega: '2024-02-01',
      progresso: 65,
      descricao: 'Princípios fundamentais da mecânica quântica.'
    },
    {
      id: '3',
      titulo: 'Química Orgânica',
      professor: 'Profa. Ana Oliveira',
      disciplina: 'Química',
      estagio: 'Estágio 1',
      ciclo: 'Ciclo 1',
      status: 'pendente',
      dataEntrega: '2024-02-15',
      progresso: 0,
      descricao: 'Introdução à química orgânica e compostos.'
    }
  ]

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-800',
    em_andamento: 'bg-blue-100 text-blue-800',
    concluida: 'bg-green-100 text-green-800'
  }

  const statusLabels = {
    pendente: 'Pendente',
    em_andamento: 'Em Andamento',
    concluida: 'Concluída'
  }

  const filteredAulas = aulas.filter(aula => {
    if (selectedEstagio !== 'todos' && aula.estagio !== selectedEstagio) return false
    if (selectedCiclo !== 'todos' && aula.ciclo !== selectedCiclo) return false
    if (selectedDisciplina !== 'todas' && aula.disciplina !== selectedDisciplina) return false
    return true
  })

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Minhas Aulas</h1>

          {/* Filtros */}
          <div className="flex gap-4">
            <select
              value={selectedEstagio}
              onChange={(e) => setSelectedEstagio(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="todos">Todos os Estágios</option>
              <option value="Estágio 1">Estágio 1</option>
              <option value="Estágio 2">Estágio 2</option>
              <option value="Estágio 3">Estágio 3</option>
            </select>

            <select
              value={selectedCiclo}
              onChange={(e) => setSelectedCiclo(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="todos">Todos os Ciclos</option>
              <option value="Ciclo 1">Ciclo 1</option>
              <option value="Ciclo 2">Ciclo 2</option>
              <option value="Ciclo 3">Ciclo 3</option>
            </select>

            <select
              value={selectedDisciplina}
              onChange={(e) => setSelectedDisciplina(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="todas">Todas as Disciplinas</option>
              <option value="Matemática">Matemática</option>
              <option value="Física">Física</option>
              <option value="Química">Química</option>
            </select>
          </div>
        </div>

        {/* Lista de Aulas */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {filteredAulas.map((aula) => (
            <div key={aula.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{aula.titulo}</h2>
                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[aula.status]}`}>
                      {statusLabels[aula.status]}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Professor</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{aula.professor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Disciplina</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{aula.disciplina}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estágio</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{aula.estagio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ciclo</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{aula.ciclo}</p>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progresso</span>
                    <span className="font-medium text-gray-900">{aula.progresso}%</span>
                  </div>
                  <div className="mt-2 relative">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${aula.progresso}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {aula.nota && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Nota</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{aula.nota}</p>
                  </div>
                )}

                {aula.dataEntrega && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Data de Entrega</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {new Date(aula.dataEntrega).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {aula.status === 'concluida' ? 'Ver Detalhes' : 'Continuar'}
                  </button>
                  {aula.status !== 'concluida' && (
                    <button className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Material de Apoio
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
