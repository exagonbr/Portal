'use client';

import React, { useState } from 'react';
import { X, FileText, User, Search, Loader2, CheckCircle } from 'lucide-react';

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
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);

  const resetModal = () => {
    setSearchType(null);
    setSearchValue('');
    setCertificates([]);
    setError('');
    setHasSearched(false);
    setShowSuccessAnimation(false);
    setShowCertificatesModal(false);
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
    setShowSuccessAnimation(false);
    setShowCertificatesModal(false);
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
        
        // Se for busca por licença e encontrou certificado, mostrar animação de sucesso
        if (searchType === 'license' && data.data && data.data.length > 0) {
          setShowSuccessAnimation(true);
          // Fechar automaticamente após 3 segundos
          setTimeout(() => {
            handleClose();
          }, 3000);
        }
        // Se for busca por CPF e encontrou certificados, mostrar modal de listagem
        else if (searchType === 'cpf' && data.data && data.data.length > 0) {
          setShowCertificatesModal(true);
        }
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

  // Componente de animação de sucesso
  const SuccessAnimation = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
        </div>
        <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full animate-ping opacity-20"></div>
      </div>
      <h3 className="text-2xl font-bold text-green-600 mb-2 animate-fade-in">
        Certificado Validado Com Sucesso!
      </h3>
      <p className="text-gray-600 text-center animate-fade-in-delay">
        O certificado foi encontrado e validado com sucesso.
      </p>
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
        <div className="bg-green-600 h-1 rounded-full animate-progress"></div>
      </div>
    </div>
  );

  // Modal de listagem de certificados
  const CertificatesListModal = () => (
    <div className="max-w-500 maxh-500">
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-1 xs:p-2 sm:p-3 lg:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[98vw] xs:max-w-[96vw] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-7xl xl:max-w-[85vw] 2xl:max-w-[80vw] max-h-[98vh] xs:max-h-[96vh] sm:max-h-[94vh] md:max-h-[92vh] lg:max-h-[90vh] overflow-hidden mx-1 xs:mx-2 sm:mx-3 lg:mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xs:p-5 sm:p-6 lg:p-8 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3 xs:gap-4">
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                Certificados Encontrados
              </h2>
              <p className="text-xs xs:text-sm sm:text-base text-blue-100 mt-1">
                {certificates.length} certificado{certificates.length !== 1 ? 's' : ''} encontrado{certificates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCertificatesModal(false)}
            className="text-white hover:text-gray-200 transition-colors p-2 xs:p-2 sm:p-3 flex-shrink-0 rounded-full hover:bg-white hover:bg-opacity-10"
          >
            <X size={20} className="xs:w-5 xs:h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
          </button>
        </div>

        {/* Content */}
        

        <div className="p-3 xs:p-4 sm:p-6 lg:p-8 max-h-[75vh] xs:max-h-[72vh] sm:max-h-[68vh] md:max-h-[65vh] lg:max-h-[62vh] overflow-y-auto">
          <div className="space-y-3 xs:space-y-4 sm:space-y-5 lg:space-y-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="border border-gray-200 rounded-xl p-4 xs:p-5 sm:p-6 lg:p-8 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 bg-gradient-to-br from-white via-gray-50 to-blue-50 hover:from-blue-50 hover:via-white hover:to-purple-50"
              >
                {/* Header do certificado - mais espaçoso */}
                <div className="mb-4 xs:mb-5 sm:mb-6">
                  <div className="flex items-start gap-3 xs:gap-4 sm:gap-5 mb-3 xs:mb-4">
                    <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FileText className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-base xs:text-lg sm:text-xl lg:text-2xl text-gray-900 leading-tight mb-1 xs:mb-2">
                        {cert.tv_show_name}
                      </h4>
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3">
                        <p className="text-xs xs:text-sm sm:text-base text-gray-500 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          Emitido em {formatDate(cert.date_created)}
                        </p>
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 xs:px-4 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-semibold shadow-md">
                          ⭐ Pontuação: {cert.score}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Informações do certificado - grid responsivo */}
                <div className="flex flex-col items-center justify-center">
                <div className=" grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6 mb-4 xs:mb-5 sm:mb-6">
                  {/* Card - Dados do Usuário */}
                  <div className="md:col-span-1 xl:col-span-2 space-y-3 xs:space-y-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 xs:p-4 sm:p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 xs:gap-4">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-800 mb-1 xs:mb-2">
                            Dados do Usuário
                          </h5>
                          <div className="space-y-2 xs:space-y-3">
                            <div>
                              <span className="text-xs xs:text-sm text-gray-600 block font-medium">Nome Completo:</span>
                              <span className="text-sm xs:text-base font-semibold text-gray-900 break-words leading-tight">
                                {cert.user.full_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs xs:text-sm text-gray-600 block font-medium">Email:</span>
                              <span className="text-sm xs:text-base font-medium text-gray-900 break-all leading-tight">
                                {cert.user.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  
                  {/* Card - Licença */}
                  <div className="md:col-span-1 xl:col-span-1">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 xs:p-4 sm:p-5 rounded-xl border border-blue-200 hover:shadow-md transition-shadow h-full">
                      <div className="flex items-start gap-3 xs:gap-4">
                        <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm xs:text-base sm:text-lg font-semibold text-blue-800 mb-2 xs:mb-3">
                            Código da Licença
                          </h5>
                          <div className="bg-blue-200 p-2 xs:p-3 rounded-lg">
                            <span className="text-sm xs:text-base lg:text-lg font-mono font-bold text-blue-900 break-all leading-tight block">
                              {cert.license_code}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card - Documento (se existir) */}
                  {cert.document && (
                    <div className="md:col-span-1 xl:col-span-1">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 xs:p-4 sm:p-5 rounded-xl border border-purple-200 hover:shadow-md transition-shadow h-full">
                        <div className="flex items-start gap-3 xs:gap-4">
                          <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-sm xs:text-base sm:text-lg font-semibold text-purple-800 mb-2 xs:mb-3">
                              Documento
                            </h5>
                            <span className="text-sm xs:text-base font-medium text-purple-900 break-words leading-tight">
                              {cert.document}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                

                {/* Botão de visualizar certificado - melhorado */}
                {cert.path && (
                  <div className="pt-4 xs:pt-5 sm:pt-6 border-t border-gray-200">
                    <a
                      href={cert.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 xs:gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 xs:px-6 sm:px-8 py-3 xs:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm xs:text-base sm:text-lg font-semibold w-full group"
                    >
                      <FileText className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                      <span>Visualizar Certificado</span>
                      <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
                    </a>
                  </div>
                )}
              </div>
              </div>
            ))}
          </div>
          
        </div>
        </div>

        {/* Footer */}
        <div className="px-4 xs:px-5 sm:px-6 lg:px-8 py-4 xs:py-5 sm:py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 items-center justify-between">
            <div className="text-center xs:text-left">
              <p className="text-xs xs:text-sm text-gray-600">
                Total de {certificates.length} certificado{certificates.length !== 1 ? 's' : ''} validado{certificates.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Validação realizada com sucesso
              </p>
            </div>
            <button
              onClick={() => setShowCertificatesModal(false)}
              className="w-full xs:w-auto px-6 xs:px-8 py-3 xs:py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm xs:text-base font-semibold group"
            >
              <span className="group-hover:scale-105 transition-transform inline-block">Fechar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 xs:p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-[98vw] xs:max-w-[95vw] sm:max-w-2xl w-full max-h-[98vh] xs:max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-1 xs:mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 xs:p-4 sm:p-6 border-b">
          <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 truncate">
            Validar Licença
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
          >
            <X size={20} className="xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 xs:p-4 sm:p-6 max-h-[85vh] xs:max-h-[80vh] sm:max-h-[75vh] overflow-y-auto">
          {!searchType ? (
            /* Escolha do tipo de busca */
            <div className="space-y-3 xs:space-y-4">
              <p className="text-gray-600 text-center mb-4 xs:mb-6 text-sm xs:text-base">
                Escolha como deseja validar o certificado:
              </p>
              
              <div className="space-y-2 xs:space-y-3">
                <button
                  onClick={() => setSearchType('license')}
                  className="w-full flex items-center gap-2 xs:gap-3 p-3 xs:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <FileText className="w-5 h-5 xs:w-6 xs:h-6 text-blue-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm xs:text-base leading-tight">Número da Licença</h3>
                    <p className="text-xs xs:text-sm text-gray-600 leading-tight">Digite o código completo da licença</p>
                  </div>
                </button>

                <button
                  onClick={() => setSearchType('cpf')}
                  className="w-full flex items-center gap-2 xs:gap-3 p-3 xs:p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors flex-shrink-0">
                    <User className="w-5 h-5 xs:w-6 xs:h-6 text-green-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm xs:text-base leading-tight">Últimos 3 Dígitos do CPF</h3>
                    <p className="text-xs xs:text-sm text-gray-600 leading-tight">Digite apenas os 3 últimos números</p>
                  </div>
                </button>
              </div>
            </div>
          ) : showSuccessAnimation ? (
            /* Animação de sucesso para busca por licença */
            <SuccessAnimation />
          ) : (
            /* Formulário de busca e resultados */
            <div className="space-y-4 xs:space-y-6">
              {/* Botão Voltar */}
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-800 text-xs xs:text-sm font-medium"
              >
                ← Voltar
              </button>

              {/* Campo de busca */}
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-2">
                  {searchType === 'license' ? 'Número da Licença' : 'Últimos 3 Dígitos do CPF'}
                </label>
                <div className="flex flex-col xs:flex-row gap-2">
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
                    className="flex-1 px-3 py-2 xs:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xs:text-base"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="px-3 xs:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 xs:gap-2 text-xs xs:text-sm font-medium min-w-0 xs:min-w-max"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span className="hidden xs:inline">Buscar Certificado</span>
                    <span className="xs:hidden">Buscar</span>
                  </button>
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="p-2 xs:p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-xs xs:text-sm leading-tight">{error}</p>
                </div>
              )}

              {/* Resultados apenas para casos de erro ou busca sem resultados */}
              {hasSearched && !isLoading && !showSuccessAnimation && !showCertificatesModal && (
                <div className="space-y-3 xs:space-y-4">
                  {certificates.length === 0 && (
                    <div className="text-center py-6 xs:py-8">
                      <div className="w-12 h-12 xs:w-16 xs:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4">
                        <Search className="w-6 h-6 xs:w-8 xs:h-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm xs:text-base">
                        Nenhum certificado encontrado
                      </h3>
                      <p className="text-gray-600 text-xs xs:text-sm leading-tight px-2">
                        Verifique se os dados informados estão corretos e tente novamente.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 bg-gray-50 border-t">
          <button
            onClick={handleClose}
            className="w-full px-3 xs:px-4 py-2 xs:py-2 sm:py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs xs:text-sm sm:text-base font-medium"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Modal de listagem de certificados para busca por CPF */}
      {showCertificatesModal && <CertificatesListModal />}

      {/* Estilos CSS para animações e responsividade */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.3s both;
        }
        
        .animate-progress {
          animation: progress 3s ease-out;
        }

        /* Responsividade extra para dispositivos muito pequenos */
        @media (max-width: 375px) {
          .text-xs {
            font-size: 0.7rem;
          }
          
          .p-2 {
            padding: 0.375rem;
          }
          
          .gap-2 {
            gap: 0.375rem;
          }
          
          .rounded-lg {
            border-radius: 0.5rem;
          }
        }

        /* Classe xs personalizada para dispositivos pequenos */
        @media (min-width: 375px) {
          .xs\\:text-xs {
            font-size: 0.75rem;
          }
          
          .xs\\:text-sm {
            font-size: 0.875rem;
          }
          
          .xs\\:text-base {
            font-size: 1rem;
          }
          
          .xs\\:text-lg {
            font-size: 1.125rem;
          }
          
          .xs\\:p-2 {
            padding: 0.5rem;
          }
          
          .xs\\:p-3 {
            padding: 0.75rem;
          }
          
          .xs\\:p-4 {
            padding: 1rem;
          }
          
          .xs\\:p-5 {
            padding: 1.25rem;
          }
          
          .xs\\:px-4 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          .xs\\:px-6 {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          
          .xs\\:px-8 {
            padding-left: 2rem;
            padding-right: 2rem;
          }
          
          .xs\\:py-4 {
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
          
          .xs\\:py-5 {
            padding-top: 1.25rem;
            padding-bottom: 1.25rem;
          }
          
          .xs\\:gap-2 {
            gap: 0.5rem;
          }
          
          .xs\\:gap-3 {
            gap: 0.75rem;
          }
          
          .xs\\:gap-4 {
            gap: 1rem;
          }
          
          .xs\\:w-4 {
            width: 1rem;
          }
          
          .xs\\:h-4 {
            height: 1rem;
          }
          
          .xs\\:w-5 {
            width: 1.25rem;
          }
          
          .xs\\:h-5 {
            height: 1.25rem;
          }
          
          .xs\\:w-10 {
            width: 2.5rem;
          }
          
          .xs\\:h-10 {
            height: 2.5rem;
          }
          
          .xs\\:w-12 {
            width: 3rem;
          }
          
          .xs\\:h-12 {
            height: 3rem;
          }
          
          .xs\\:max-w-\\[96vw\\] {
            max-width: 96vw;
          }
          
          .xs\\:max-h-\\[96vh\\] {
            max-height: 96vh;
          }
          
          .xs\\:mb-2 {
            margin-bottom: 0.5rem;
          }
          
          .xs\\:mb-3 {
            margin-bottom: 0.75rem;
          }
          
          .xs\\:mb-4 {
            margin-bottom: 1rem;
          }
          
          .xs\\:mb-5 {
            margin-bottom: 1.25rem;
          }
          
          .xs\\:space-y-3 > * + * {
            margin-top: 0.75rem;
          }
          
          .xs\\:space-y-4 > * + * {
            margin-top: 1rem;
          }
          
          .xs\\:flex-row {
            flex-direction: row;
          }
          
          .xs\\:items-center {
            align-items: center;
          }
          
          .xs\\:text-left {
            text-align: left;
          }
          
          .xs\\:w-auto {
            width: auto;
          }
          
          .xs\\:hidden {
            display: none;
          }
          
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
};

export { LicenseValidationModal };