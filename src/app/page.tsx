'use client';
import Link from 'next/link';
import Image from 'next/image';
import SimpleCarousel from '../components/SimpleCarousel';

export default function HomePage() {
  const carouselImages = [
    {
      src: '/carousel-images/education1.jpg',
      alt: 'Educação e Tecnologia',
      title: 'Inovação no Ensino'
    },
    {
      src: '/carousel-images/education2.jpg',
      alt: 'Cultura e Aprendizado',
      title: 'Cultura e Conhecimento'
    },
    {
      src: '/carousel-images/education3.jpg',
      alt: 'Desenvolvimento Educacional',
      title: 'Desenvolvimento Contínuo'
    }
  ];

    return (
      <div className="min-h-screen">
        {/* Carousel Section */}
        <div className="w-full h-[400px] relative mb-8">
          <SimpleCarousel images={carouselImages} autoplaySpeed={5000} />
        </div>
  
        <div className="max-w-7xl mx-auto py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
              <span className="block text-[#2B4B6F]">Aprendizado Simplificado</span>
            </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Uma plataforma completa para professores e alunos gerenciarem suas atividades educacionais.
            Acesse suas aulas, materiais e muito mais.
          </p>
        </div>

        {/* Features */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-[#2B4B6F] rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Gestão de Cursos
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Organize seus cursos, materiais e atividades em um só lugar.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-[#2B4B6F] rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Aulas ao Vivo
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Participe de aulas ao vivo interativas com seus professores e colegas.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-[#2B4B6F] rounded-md shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                    Acompanhamento de Progresso
                  </h3>
                  <p className="mt-5 text-base text-gray-500">
                    Monitore seu desempenho e progresso em cada curso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary to-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Comece sua jornada de aprendizado agora
          </h2>
          <Link
            href="/register"
            className="bg-white text-primary font-bold py-4 px-8 rounded-lg hover:bg-opacity-90 transition-all"
          >
            Criar Conta
          </Link>
        </div>
      </div>
    </div>
  );
}
