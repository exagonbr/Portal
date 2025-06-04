'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function ManageLessonsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-600">Gerenciar Aulas</h1>
          <p className="text-gray-600">Crie e organize o conteúdo das aulas</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Importar Conteúdo
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Nova Aula
          </button>
        </div>
      </div>

      {/* Course Selection and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Selecionar Curso</option>
          <option value="course1">Matemática Básica</option>
          <option value="course2">Física Fundamental</option>
        </select>
        <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Selecionar Módulo</option>
          <option value="module1">Módulo 1</option>
          <option value="module2">Módulo 2</option>
        </select>
        <input
          type="text"
          placeholder="Pesquisar aulas..."
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Content Management */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-4">Estrutura do Curso</h3>
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-700">Módulo 1</div>
              <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">Módulo 2</div>
              <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">Módulo 3</div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-800">
                + Adicionar Módulo
              </button>
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            {/* Lesson Item */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="cursor-move text-gray-400">⋮⋮</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Introdução à Álgebra</h3>
                    <p className="text-gray-600">Duração: 45min • Módulo 1</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Publicada
                  </span>
                  <button className="text-gray-600 hover:text-gray-600">
                    <span className="material-icons">mais_vert</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Another Lesson Item */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="cursor-move text-gray-400">⋮⋮</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Equações do 1º Grau</h3>
                    <p className="text-gray-600">Duração: 60min • Módulo 1</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Rascunho
                  </span>
                  <button className="text-gray-600 hover:text-gray-600">
                    <span className="material-icons">mais_vert</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Lesson Button */}
          <button className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500">
            + Adicionar Nova Aula
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Prévia do Conteúdo</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="aspect-video bg-gray-100 rounded-lg mb-4"></div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-600">Introdução à Álgebra</h3>
              <p className="text-gray-600">Última atualização: 01/01/2024</p>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-600">
                Visualizar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
