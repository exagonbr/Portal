import React, { useState } from 'react';
import CenteredSquareBox from '@/components/ui/CenteredSquareBox';
import { AnimatePresence } from 'framer-motion';

const CenteredSquareBoxExample: React.FC = () => {
  const [showBox, setShowBox] = useState(false);
  const [currentSize, setCurrentSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [glassEffect, setGlassEffect] = useState(false);

  const handleOpenBox = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    setCurrentSize(size);
    setShowBox(true);
  };

  const handleCloseBox = () => {
    setShowBox(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Box Quadrado Centralizado
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Demonstração dos Tamanhos
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => handleOpenBox('sm')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Pequeno (16rem)
            </button>
            
            <button
              onClick={() => handleOpenBox('md')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Médio (20rem)
            </button>
            
            <button
              onClick={() => handleOpenBox('lg')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Grande (24rem)
            </button>
            
            <button
              onClick={() => handleOpenBox('xl')}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Extra Grande (28rem)
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={glassEffect}
                onChange={(e) => setGlassEffect(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Efeito Glass</span>
            </label>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Características:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Perfeitamente quadrado</li>
              <li>✅ Centralizado na tela</li>
              <li>✅ Overlay com blur</li>
              <li>✅ Animações suaves</li>
              <li>✅ Responsivo</li>
              <li>✅ Suporte a temas</li>
              <li>✅ Efeito glass opcional</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Exemplo de Código
          </h2>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`import CenteredSquareBox from '@/components/ui/CenteredSquareBox';

function MyComponent() {
  const [showBox, setShowBox] = useState(false);

  return (
    <>
      <button onClick={() => setShowBox(true)}>
        Abrir Box
      </button>
      
      <AnimatePresence>
        {showBox && (
          <CenteredSquareBox
            size="md"
            glass={true}
            onOverlayClick={() => setShowBox(false)}
          >
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">
                Conteúdo do Box
              </h2>
              <p>Seu conteúdo aqui...</p>
            </div>
          </CenteredSquareBox>
        )}
      </AnimatePresence>
    </>
  );
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Box Modal */}
      <AnimatePresence>
        {showBox && (
          <CenteredSquareBox
            size={currentSize}
            glass={glassEffect}
            onOverlayClick={handleCloseBox}
          >
            <div className="text-center p-6">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Box Quadrado
                </h2>
                
                <p className="text-gray-600 mb-4">
                  Tamanho: {currentSize.toUpperCase()}
                </p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Largura = Altura</p>
                  <p>Perfeitamente centralizado</p>
                  <p>Responsivo e acessível</p>
                </div>
              </div>
              
              <button
                onClick={handleCloseBox}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </CenteredSquareBox>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CenteredSquareBoxExample; 