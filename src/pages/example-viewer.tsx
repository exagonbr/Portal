'use client';

import React, { useState } from 'react';
import BookViewer from '../components/books/BookViewer';
import { Button } from '../components/ui/button';

export default function ExemploVisualizador() {
  const [showViewer, setShowViewer] = useState(false);
  
  // URL do livro no formato solicitado
  const exampleBookUrl = 'https://d1hxtyafwtqtm4.cloudfront.net/upload/1747056985879';
  const bookTitle = 'A Invenção de Morel';
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Exemplo de Visualizador de Livros</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Visualizar PDF externo</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Clique no botão abaixo para visualizar um PDF de exemplo carregado de uma URL externa.
          Este exemplo demonstra como usar o componente BookViewer para carregar PDFs do Cloudfront.
        </p>
        
        <div className="flex space-x-4">
          <Button 
            onClick={() => setShowViewer(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Abrir Visualizador
          </Button>
          
          <Button 
            onClick={() => window.open('https://lib.sabercon.com.br/#/pdf/1747056985879?title=invencao_morel_MIOLO.pdf&file=1747056985879', '_blank')}
            variant="outline"
          >
            Abrir no Sabercon
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold mb-2">Exemplo de código:</h3>
        <pre className="text-xs bg-black text-green-400 p-4 rounded">
{`// Carregar PDF do Cloudfront
<BookViewer
  bookUrl="https://d1hxtyafwtqtm4.cloudfront.net/upload/1747056985879"
  bookTitle="A Invenção de Morel"
  bookType="pdf"
  onClose={() => setShowViewer(false)}
/>`}
        </pre>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Observações:</h4>
        <ul className="list-disc ml-5 mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          <li>O visualizador suporta formatos PDF e EPUB</li>
          <li>É possível selecionar texto para destacar, adicionar notas ou pesquisar</li>
          <li>Compatível com URLs do Cloudfront e do Sabercon</li>
        </ul>
      </div>
      
      {showViewer && (
        <BookViewer
          bookUrl={exampleBookUrl}
          bookTitle={bookTitle}
          bookType="pdf"
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
} 