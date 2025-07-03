import { Header } from '@/components/layout';

export default function BooksPortal() {
  return (
    <div className="min-h-screen bg-white">
      <Header title="Biblioteca Digital" showUserMenu={false} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Biblioteca Digital
            </h1>
            <p className="text-lg text-gray-600">
              Explore nossa coleção de livros educacionais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder para livros */}
            {[1, 2, 3, 4, 5, 6].map((book) => (
              <div key={book} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Livro {book}
                </h3>
                <p className="text-gray-600 text-sm">
                  Descrição do livro educacional {book}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}