'use client';

import React, { useState, useCallback, DragEvent, ChangeEvent } from 'react';

interface ImportFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: File[]) => void;
}

export default function ImportFilesModal({ isOpen, onClose, onImport }: ImportFilesModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = () => {
    if (selectedFiles.length > 0) {
      onImport(selectedFiles);
      setSelectedFiles([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Importar Livros</h2>

        <div
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <p className="text-gray-500">
            Arraste e solte arquivos aqui ou clique para selecionar
          </p>
          <input
            id="fileInput"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Arquivos Selecionados:</h3>
            <ul className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center py-1">
                  <span className="truncate">{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    aria-label={`Remover ${file.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={selectedFiles.length === 0}
            className={`px-4 py-2 rounded text-white ${
              selectedFiles.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Importar
          </button>
        </div>
      </div>
    </div>
  );
}
