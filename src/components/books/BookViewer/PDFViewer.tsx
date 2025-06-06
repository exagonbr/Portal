'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  zoom: number;
  onDocumentLoaded: (numPages: number) => void;
  onError: (error: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  currentPage,
  setCurrentPage,
  zoom,
  onDocumentLoaded,
  onError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderTask, setRenderTask] = useState<any>(null);

  // Carregar PDF.js dinamicamente
  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        // Verificar se PDF.js já está carregado
        if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
          return (window as any).pdfjsLib;
        }

        // Carregar PDF.js via CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        
        return new Promise((resolve, reject) => {
          script.onload = () => {
            const pdfjsLib = (window as any).pdfjsLib;
            if (pdfjsLib) {
              // Configurar worker
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              resolve(pdfjsLib);
            } else {
              reject(new Error('PDF.js não foi carregado corretamente'));
            }
          };
          script.onerror = () => reject(new Error('Falha ao carregar PDF.js'));
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Erro ao carregar PDF.js:', error);
        onError('Erro ao carregar biblioteca PDF.js');
        return null;
      }
    };

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        const pdfjsLib = await loadPDFJS();
        
        if (!pdfjsLib) {
          onError('PDF.js não está disponível');
          return;
        }

        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        onDocumentLoaded(pdf.numPages);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar PDF:', error);
        onError(`Erro ao carregar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [fileUrl, onDocumentLoaded, onError]);

  // Renderizar página atual
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || isLoading) return;

    const renderPage = async () => {
      try {
        // Cancelar renderização anterior se existir
        if (renderTask) {
          renderTask.cancel();
        }

        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) {
          onError('Não foi possível obter contexto do canvas');
          return;
        }

        // Calcular escala baseada no zoom
        const viewport = page.getViewport({ scale: zoom / 100 });
        
        // Configurar canvas
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Configurar renderização
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        // Iniciar renderização
        const task = page.render(renderContext);
        setRenderTask(task);
        
        await task.promise;
        setRenderTask(null);
      } catch (error: any) {
        if (error.name !== 'RenderingCancelledException') {
          console.error('Erro ao renderizar página:', error);
          onError(`Erro ao renderizar página: ${error.message}`);
        }
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, zoom, renderTask, onError]);

  // Limpeza
  useEffect(() => {
    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [pdfDoc, renderTask]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full overflow-auto bg-gray-100 dark:bg-gray-800">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full shadow-lg"
          style={{
            display: 'block',
            margin: '0 auto'
          }}
        />
        {!pdfDoc && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Erro ao carregar PDF
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer; 