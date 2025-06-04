'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/services/apiClient'; // Ajuste o caminho se necessário

interface Course {
  id: number | string;
  name: string;
  description: string;
  instructor?: string; // Opcional
  duration?: string; // Opcional
  // Adicione mais campos conforme necessário
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // TODO: Ajustar o endpoint da API conforme necessário
        const response = await apiClient.get<{ courses: Course[] }>('/api/courses');
        
        if (response.success && response.data) {
          setCourses(response.data.courses || []);
        } else {
          setError(response.message || 'Falha ao buscar cursos.');
        }
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError('Ocorreu um erro desconhecido ao buscar cursos.');
        }
        console.error("Erro ao buscar cursos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nossos Cursos</h1>
          <p className="text-gray-600">
            Explore nossa lista de cursos disponíveis.
          </p>
        </div>

        {/* Botão para Adicionar Novo Curso (aponta para demo modals por enquanto) */}
        <div className="mb-6 text-right">
          <Link
            href="/admin/demo-modals" // Ou para a página/modal de criação de curso real
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="material-icons-outlined mr-2" style={{verticalAlign: 'bottom'}}>add</span>
            Adicionar Novo Curso
          </Link>
        </div>
        
        {loading && (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">Carregando cursos...</p>
            {/* Adicionar um spinner/loader visual aqui seria bom */}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="ml-4 mt-2 sm:mt-0 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-10 bg-white rounded-lg shadow-md p-6">
            <span className="text-5xl block mx-auto mb-4">😕</span>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum curso encontrado</h2>
            <p className="text-gray-500">
              Parece que não há cursos cadastrados no momento.
              Você pode <Link href="/admin/demo-modals" className="text-blue-600 hover:underline">adicionar um novo curso</Link>.
            </p>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Imagem do curso (opcional) */}
                {/* <img src={`https://via.placeholder.com/400x200?text=${encodeURIComponent(course.name)}`} alt={course.name} className="w-full h-48 object-cover"/> */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">{course.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 h-20 overflow-hidden">{course.description}</p>
                  {course.instructor && (
                    <p className="text-xs text-gray-500 mb-1">Instrutor: {course.instructor}</p>
                  )}
                  {course.duration && (
                    <p className="text-xs text-gray-500 mb-4">Duração: {course.duration}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/courses/${course.id}`} // Link para detalhes do curso (precisa ser criado)
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver Detalhes
                    </Link>
                    <Link
                      href={`/admin/demo-modals`} // Ou para a página/modal de edição de curso real
                      className="text-xs bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Seção de Funcionalidades Planejadas e Modais pode ser mantida ou removida dependendo da estratégia */}
        {/* Por ora, vou comentá-la para focar na listagem */}
        {/*
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">✨ Funcionalidades Futuras</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Filtros avançados e busca</li>
              <li>• Paginação</li>
              <li>• Detalhes completos do curso</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Modais de Gerenciamento</h3>
            <p className="text-sm text-gray-600 mb-2">
              Para criar ou editar cursos, utilize os modais de demonstração:
            </p>
            <Link
              href="/admin/demo-modals"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              🎭 Testar Modais de Curso
            </Link>
          </div>
        </div>
        */}

        {/* Links de Navegação Inferiores */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/dashboard/admin"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🏠 Voltar ao Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              👥 Gestão de Usuários
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
