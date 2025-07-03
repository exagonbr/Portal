'use client';

import React, { useState } from 'react';
import { X, FileText, User, Search, Loader2 } from 'lucide-react';

interface Certificate {
  id: number;
  license_code: string;
  document: string;
  tv_show_name: string;
  score: number;
  date_created: string;
  path: string;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
}

interface LicenseValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchType = 'license' | 'cpf' | null;

const LicenseValidationModal: React.FC<LicenseValidationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchType, setSearchType] = useState<SearchType>(null);
  const [searchValue, setSearchValue] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const resetModal = () => {
    setSearchType(null);
    setSearchValue('');
    setCertificates([]);
    setError('');
    setHasSearched(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleBack = () => {
    setSearchType(null);
    setSearchValue('');
    setError('');
    setHasSearched(false);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Por favor, digite um valor para buscar');
      return;
    }

    if (searchType === 'cpf' && !/^\d{3}$/.test(searchValue)) {
      setError('Digite exatamente 3 números');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchType === 'license') {
        params.set('license_code', searchValue);
      } else if (searchType === 'cpf') {
        params.set('cpf_last_digits', searchValue);
      }

      const response = await fetch(`/api/certificates/search?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCertificates(data.data || []);
      } else {
        setError(data.message || 'Erro ao buscar certificados');
        setCertificates([]);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      setCertificates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Validar Licença
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!searchType ? (
            /* Escolha do tipo de busca */
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Escolha como deseja validar o certificado:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setSearchType('license')}
                  className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Número da Licença</h3>
                    <p className="text-sm text-gray-600">Digite o código completo da licença</p>
                  </div>
                </button>

                <button
                  onClick={() => setSearchType('cpf')}
                  className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Últimos 3 Dígitos do CPF</h3>
                    <p className="text-sm text-gray-600">Digite apenas os 3 últimos números</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Formulário de busca e resultados */
            <div className="space-y-6">
              {/* Botão Voltar */}
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Voltar
              </button>

              {/* Campo de busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {searchType === 'license' ? 'Número da Licença' : 'Últimos 3 Dígitos do CPF'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={
                      searchType === 'license' 
                        ? 'Digite o número da licença' 
                        : 'Digite os 3 últimos dígitos'
                    }
                    maxLength={searchType === 'cpf' ? 3 : undefined}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    Buscar
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Resultados */}
              {hasSearched && !isLoading && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    {certificates.length > 0 
                      ? `${certificates.length} certificado(s) encontrado(s)` 
                      : 'Nenhum certificado encontrado'
                    }
                  </h3>

                  {certificates.length > 0 && (
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {cert.tv_show_name}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(cert.date_created)}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Nome:</strong> {cert.user.full_name}</p>
                            <p><strong>Email:</strong> {cert.user.email}</p>
                            <p><strong>Licença:</strong> {cert.license_code}</p>
                            <p><strong>Pontuação:</strong> {cert.score}</p>
                            {cert.document && (
                              <p><strong>Documento:</strong> {cert.document}</p>
                            )}
                          </div>

                          {cert.path && (
                            <div className="mt-3">
                              <a
                                href={cert.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <FileText className="w-4 h-4" />
                                Ver Certificado
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicenseValidationModal;