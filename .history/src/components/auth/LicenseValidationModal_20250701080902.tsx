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
  const CertificatesListModal = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
    const [showFullDetails, setShowFullDetails] = useState(false)

    const sortedCertificates = [...certificates].sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date_created).getTime()
          bValue = new Date(b.date_created).getTime()
          break
        case 'score':
          aValue = a.score || 0
          bValue = b.score || 0
          break
        case 'name':
          aValue = a.tv_show_name?.toLowerCase() || ''
          bValue = b.tv_show_name?.toLowerCase() || ''
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    const handleCertificateClick = (cert: Certificate) => {
      setSelectedCert(cert)
      setShowFullDetails(true)
    }

    return (
      <div className="fixed inset-100 min-w-250 max-h-100 bg-black bg-opacity-70 items-center justify-center z-999 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[98vw] sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw] max-h-[98vh] sm:max-h-[95vh] lg:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header Aprimorado */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
            <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white mb-1">
                    🎓 Certificados Encontrados
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-blue-100 font-medium">
                    {certificates.length} certificado{certificates.length !== 1 ? 's' : ''} validado{certificates.length !== 1 ? 's' : ''} com sucesso
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm text-green-200 font-medium">Status: Verificado</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCertificatesModal(false)}
                className="text-white hover:text-red-200 transition-all duration-300 p-3 sm:p-4 flex-shrink-0 rounded-2xl hover:bg-red-500 hover:bg-opacity-20 border border-transparent hover:border-red-300 group"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Controles de Visualização */}
            <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {/* Modo de Visualização */}
                  <div className="flex bg-white/20 rounded-xl p-1 border border-white/30">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                        viewMode === 'grid'
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                          <div className="bg-current rounded-sm"></div>
                        </div>
                        <span className="hidden sm:inline">Grade</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                        viewMode === 'list'
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 flex flex-col gap-0.5">
                          <div className="bg-current h-0.5 rounded"></div>
                          <div className="bg-current h-0.5 rounded"></div>
                          <div className="bg-current h-0.5 rounded"></div>
                        </div>
                        <span className="hidden sm:inline">Lista</span>
                      </div>
                    </button>
                  </div>

                  {/* Ordenação */}
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-')
                      setSortBy(sort as 'date' | 'score' | 'name')
                      setSortOrder(order as 'asc' | 'desc')
                    }}
                    className="bg-white/20 border border-white/30 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="date-desc" className="text-gray-900">📅 Mais Recente</option>
                    <option value="date-asc" className="text-gray-900">📅 Mais Antigo</option>
                    <option value="score-desc" className="text-gray-900">⭐ Maior Pontuação</option>
                    <option value="score-asc" className="text-gray-900">⭐ Menor Pontuação</option>
                    <option value="name-asc" className="text-gray-900">🔤 Nome A-Z</option>
                    <option value="name-desc" className="text-gray-900">🔤 Nome Z-A</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Todos os certificados são válidos
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-4 sm:p-6 lg:p-8">
              {viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {sortedCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => handleCertificateClick(cert)}
                      className="group bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:border-blue-300"
                    >
                      {/* Card Header */}
                      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-base sm:text-lg text-gray-900 leading-tight mb-2 line-clamp-2">
                            {cert.tv_show_name}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs sm:text-sm text-gray-500">
                              {formatDate(cert.date_created)}
                            </span>
                          </div>
                          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md inline-block">
                            ⭐ {cert.score} pontos
                          </div>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="space-y-3">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200">
                          <div className="text-xs text-blue-600 font-medium mb-1">👨‍🎓 Estudante</div>
                          <div className="text-sm font-bold text-gray-900 truncate">{cert.user.full_name}</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-purple-200">
                          <div className="text-xs text-purple-600 font-medium mb-1">🔑 Código</div>
                          <div className="text-sm font-mono font-bold text-gray-900 truncate">{cert.license_code}</div>
                        </div>
                      </div>

                      {/* Action Hint */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center text-xs text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                          <span>Clique para ver detalhes completos</span>
                          <div className="ml-2 w-4 h-4 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                            <span className="text-blue-600 text-xs">→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="space-y-4 sm:space-y-6">
                  {sortedCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => handleCertificateClick(cert)}
                      className="group bg-gradient-to-r from-white via-blue-50 to-purple-50 border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 cursor-pointer hover:border-blue-300"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-lg sm:text-xl text-gray-900 leading-tight mb-2">
                              {cert.tv_show_name}
                            </h4>
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span>{formatDate(cert.date_created)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>👨‍🎓</span>
                                <span>{cert.user.full_name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>📧</span>
                                <span className="truncate max-w-[200px]">{cert.user.email}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                ⭐ {cert.score} pontos
                              </div>
                              <div className="bg-gradient-to-r from-purple-400 to-violet-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                🔑 {cert.license_code}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center sm:justify-end">
                          <div className="text-sm text-blue-600 font-medium group-hover:text-blue-700 transition-colors flex items-center gap-2">
                            <span>Ver detalhes</span>
                            <div className="w-6 h-6 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                              <span className="text-blue-600 text-sm">→</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Aprimorado */}
          <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-center sm:text-left">
                <p className="text-sm sm:text-base text-gray-700 font-semibold">
                  📊 Total: {certificates.length} certificado{certificates.length !== 1 ? 's' : ''} validado{certificates.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  ✅ Todos os certificados foram verificados e são autênticos
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
                <button
                  onClick={() => setShowCertificatesModal(false)}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold group"
                >
                  <span className="group-hover:scale-105 transition-transform inline-block">Fechar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Detalhes Completos */}
        {showFullDetails && selectedCert && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-70 p-2 sm:p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] max-h-[95vh] overflow-hidden flex flex-col">
              {/* Header do Modal de Detalhes */}
              <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 via-blue-700 to-purple-800 text-white p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mb-1">
                        Detalhes do Certificado
                      </h3>
                      <p className="text-blue-100 text-sm sm:text-base">
                        {selectedCert.tv_show_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFullDetails(false)}
                    className="text-white hover:text-red-200 transition-all p-2 sm:p-3 rounded-xl hover:bg-red-500/20"
                  >
                    <X className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>
              </div>

              {/* Conteúdo dos Detalhes */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="space-y-6 sm:space-y-8">
                  {/* Banner Principal */}
                  <div className="relative bg-gradient-to-br from-indigo-600 via-blue-700 to-purple-800 p-6 sm:p-8 lg:p-12 rounded-3xl shadow-2xl border-4 border-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6 sm:gap-8">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                          <FileText className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-4">
                          <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold border border-white/30">
                            🎓 CERTIFICADO VALIDADO
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight">
                          {selectedCert.tv_show_name}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30">
                            <div className="text-white/80 text-sm sm:text-base font-medium mb-2">Pontuação Final</div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                                {selectedCert.score}
                              </span>
                              <div className="text-white/80">
                                <div className="text-sm sm:text-base font-medium">pontos</div>
                                <div className="text-xs sm:text-sm">⭐⭐⭐⭐⭐</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30">
                            <div className="text-white/80 text-sm sm:text-base font-medium mb-2">Data de Conclusão</div>
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                              {formatDate(selectedCert.date_created)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Estudante */}
                  <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 p-6 sm:p-8 lg:p-12 rounded-3xl border-4 border-emerald-200 shadow-2xl">
                    <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-emerald-900 mb-2">
                          👤 Dados do Estudante
                        </h4>
                        <p className="text-sm sm:text-base lg:text-lg text-emerald-700 font-medium">
                          Informações pessoais do portador do certificado
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                      <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 lg:p-8 rounded-2xl border-2 border-emerald-300 shadow-lg">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm sm:text-base">👨‍🎓</span>
                          </div>
                          <span className="text-sm sm:text-base lg:text-lg text-emerald-700 font-bold">Nome Completo</span>
                        </div>
                        <p className="text-lg sm:text-xl lg:text-2xl font-black text-emerald-900 break-words leading-tight">
                          {selectedCert.user.full_name}
                        </p>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 lg:p-8 rounded-2xl border-2 border-emerald-300 shadow-lg">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm sm:text-base">📧</span>
                          </div>
                          <span className="text-sm sm:text-base lg:text-lg text-emerald-700 font-bold">Email de Contato</span>
                        </div>
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-emerald-900 break-all leading-tight">
                          {selectedCert.user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dados da Certificação */}
                  <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-100 p-6 sm:p-8 lg:p-12 rounded-3xl border-4 border-purple-200 shadow-2xl">
                    <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                        <Search className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-purple-900 mb-2">
                          🏆 Dados da Certificação
                        </h4>
                        <p className="text-sm sm:text-base lg:text-lg text-purple-700 font-medium">
                          Informações técnicas e código de validação
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-6 sm:space-y-8">
                      {/* Código da Licença */}
                      <div className="bg-gradient-to-r from-purple-600 to-violet-700 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl">
                        <div className="text-center">
                          <h5 className="text-white/90 text-sm sm:text-base lg:text-lg font-bold mb-4 sm:mb-6">
                            🔑 CÓDIGO DE VALIDAÇÃO OFICIAL
                          </h5>
                          <div className="bg-white/20 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-white/30">
                            <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-mono font-black text-white break-all leading-tight tracking-wider">
                              {selectedCert.license_code}
                            </div>
                          </div>
                          <p className="text-white/80 text-xs sm:text-sm lg:text-base mt-3 sm:mt-4">
                            Este código garante a autenticidade do certificado
                          </p>
                        </div>
                      </div>
                      
                      {/* Documento adicional */}
                      {selectedCert.document && (
                        <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 lg:p-8 rounded-2xl border-2 border-purple-300 shadow-lg">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-sm sm:text-base lg:text-lg text-purple-700 font-bold">📄 Documento Adicional</span>
                          </div>
                          <p className="text-base sm:text-lg lg:text-xl font-bold text-purple-900 break-words leading-tight">
                            {selectedCert.document}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de visualizar certificado */}
                  {selectedCert.path && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 sm:p-8 rounded-2xl border-2 border-blue-200">
                      <a
                        href={selectedCert.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg font-semibold w-full group"
                      >
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                        <span>Visualizar Certificado Original</span>
                        <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity"></div>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer do Modal de Detalhes */}
              <div className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 border-t">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => setShowFullDetails(false)}
                    className="px-6 sm:px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors text-sm sm:text-base font-semibold"
                  >
                    Voltar à Lista
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

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