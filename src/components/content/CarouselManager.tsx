'use client';

import { useState } from 'react';
import { CarouselImage } from './AreaContentManager';

interface CarouselManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, metadata: { title: string; description: string }) => Promise<void>;
  images: CarouselImage[];
  onDelete?: (image: CarouselImage) => Promise<void>;
}

export default function CarouselManager({
  isOpen,
  onClose,
  onUpload,
  images,
  onDelete
}: CarouselManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione uma imagem');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await onUpload(file, {
        title,
        description
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Gerenciar Imagens do Carrossel</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Images */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Imagens Atuais</h3>
            <div className="space-y-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 flex items-start space-x-4"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{image.title}</h4>
                    <p className="text-sm text-gray-600">{image.alt}</p>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(image)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {images.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma imagem no carrossel ainda
                </p>
              )}
            </div>
          </div>

          {/* Upload Form */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Enviar Nova Imagem</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagem</label>
                <input
                  type="file"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full"
                  accept="image/*"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={uploading}
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
