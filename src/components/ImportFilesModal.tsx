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
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-primary rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Importar Livros</h2>

        <div
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors duration-200 ${
            dragOver ? 'border-primary-DEFAULT bg-primary-light/20' : 'border-border-DEFAULT hover:border-primary-light'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <p className="text-text-secondary">
            Arraste e solte arquivos aqui ou clique para selecionar
          </p>
          <input
            id="fileInput"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".epub,.pdf,.mobi" // Example: accept specific book formats
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2 text-text-primary">Arquivos Selecionados:</h3>
            <ul className="max-h-40 overflow-y-auto border border-border-light rounded p-2 bg-background-secondary">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center py-1.5 px-2 hover:bg-background-tertiary rounded">
                  <span className="truncate text-sm text-text-secondary">{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-error-DEFAULT hover:text-error-dark ml-2 text-lg"
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
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors rounded-md border border-border-DEFAULT hover:bg-background-tertiary"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={selectedFiles.length === 0}
            className={`px-4 py-2 rounded text-white font-medium transition-colors ${
              selectedFiles.length === 0
                ? 'bg-secondary-light text-text-disabled cursor-not-allowed'
                : 'bg-primary-DEFAULT hover:bg-primary-dark'
            }`}
          >
            Importar
          </button>
        </div>
      </div>
    </div>
  );
}
