'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from '../../hooks/useForm';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge, CreditCard, Search, X, User, Calendar, Award, FileText } from 'lucide-react';

interface SearchFormData {
  numeroLicenca: string;
  cpfLastDigits: string;
}

const searchInitialValues: SearchFormData = {
  numeroLicenca: '',
  cpfLastDigits: ''
};

const searchValidationRules = {
  numeroLicenca: (value: string) => {
    if (!value) return 'O número da licença é obrigatório';
    return '';
  },
  cpfLastDigits: (value: string) => {
    if (!value) return 'Os 3 últimos dígitos do CPF são obrigatórios';
    if (!/^\d{3}$/.test(value)) return 'Deve conter exatamente 3 dígitos';
    return '';
  }
};

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

type SearchMode = 'selection' | 'license' | 'cpf';

export function LicenseValidationModal({ isOpen, onClose }: LicenseValidationModalProps) {
  const { theme } = useTheme();
  const [searchMode, setSearchMode] = useState<SearchMode>('selection');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string>('');

  const {
    values: searchValues,
    errors: searchErrors,
    touched: searchTouched,
    isSubmitting: isSearchSubmitting,
    handleChange: handleSearchChange,
    handleBlur: handleSearchBlur,
    handleSubmit: handleSearchSubmit,
    resetForm
  } = useForm<SearchFormData>({
    initialValues: searchInitialValues,
    validationRules: searchValidationRules,
    onSubmit: async (formValues) => {
      try {
        setIsLoading(true);
        setSearchError('');
        
        const searchParams = new URLSearchParams();
        
        if (searchMode === 'license') {
          searchParams.append('license_code', formValues.numeroLicenca);
        } else if (searchMode === 'cpf') {
          searchParams.append('cpf_last_digits', formValues.cpfLastDigits);
        }

        const response = await fetch(`/api/certificates/search?${searchParams}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setCertificates(data.data || []);
          if (data.data.length === 0) {
            setSearchError('Nenhum certificado encontrado com os dados informados.');
          }
        } else {
          setSearchError(data.message || 'Erro ao buscar certificados.');
          setCertificates([]);
        }
      } catch (error) {
        console.error('Erro durante a busca:', error);
        setSearchError('Erro interno do servidor. Tente novamente.');
        setCertificates([]);
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleClose = () => {
    resetForm();
    setSearchMode('selection');
    setCertificates([]);
    setSearchError('');
    onClose();
  };

  const handleBackToSelection = () => {
    resetForm();
    setSearchMode('selection');
    setCertificates([]);
    setSearchError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl rounded-lg text-left overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.DEFAULT}`
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: theme.colors.border.light }}>
          <div className="flex items-center justify-between">
            <h3
              className="text-xl font-semibold flex items-center gap-2"
              id="modal-title"
              style={{ color: theme.colors.text.primary }}
            >
              <Badge className="h-5 w-5" />
              Validar Licença
            </h3>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" style={{ color: theme.colors.text.secondary }} />
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <AnimatePresence mode="wait">
            {/* Tela de Seleção */}
            {searchMode === 'selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    Escolha como deseja buscar seu certificado:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Botão Número da Licença */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSearchMode('license')}
                    className="p-6 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid"
                    style={{
                      borderColor: theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.secondary
                    }}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: theme.colors.primary.DEFAULT + '20' }}
                      >
                        <CreditCard 
                          className="h-8 w-8" 
                          style={{ color: theme.colors.primary.DEFAULT }} 
                        />
                      </div>
                      <div className="text-center">
                        <h4 
                          className="font-semibold text-lg"
                          style={{ color: theme.colors.text.primary }}
                        >
                          Número da Licença
                        </h4>
                        <p 
                          className="text-sm mt-1"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          Digite o código da licença do seu certificado
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Botão CPF */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSearchMode('cpf')}
                    className="p-6 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid"
                    style={{
                      borderColor: theme.colors.border.DEFAULT,
                      backgroundColor: theme.colors.background.secondary
                    }}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: theme.colors.secondary.DEFAULT + '20' }}
                      >
                        <User 
                          className="h-8 w-8" 
                          style={{ color: theme.colors.secondary.DEFAULT }} 
                        />
                      </div>
                      <div className="text-center">
                        <h4 
                          className="font-semibold text-lg"
                          style={{ color: theme.colors.text.primary }}
                        >
                          Últimos 3 Dígitos do CPF
                        </h4>
                        <p 
                          className="text-sm mt-1"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          Digite os 3 últimos números do seu CPF
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Tela de Busca por Licença */}
            {searchMode === 'license' && (
              <motion.div
                key="license"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleBackToSelection}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <h4 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                    Buscar por Número da Licença
                  </h4>
                </div>

                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="numeroLicenca"
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Número da Licença
                    </label>
                    <div className="relative">
                      <CreditCard 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                        style={{ color: theme.colors.text.tertiary }}
                      />
                      <input
                        id="numeroLicenca"
                        name="numeroLicenca"
                        type="text"
                        required
                        value={searchValues.numeroLicenca}
                        onChange={handleSearchChange}
                        onBlur={handleSearchBlur}
                        className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                          searchTouched.numeroLicenca && searchErrors.numeroLicenca
                            ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-2 focus:ring-2'
                        }`}
                        style={{
                          backgroundColor: theme.colors.background.secondary,
                          borderColor: searchTouched.numeroLicenca && searchErrors.numeroLicenca 
                            ? theme.colors.status.error 
                            : theme.colors.border.DEFAULT,
                          color: theme.colors.text.primary,
                        }}
                        placeholder="Digite o número da licença do certificado"
                      />
                      {searchTouched.numeroLicenca && searchErrors.numeroLicenca && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm flex items-center gap-1"
                          style={{ color: theme.colors.status.error }}
                        >
                          <span className="material-symbols-outlined text-base">error</span>
                          {searchErrors.numeroLicenca}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: theme.colors.primary.DEFAULT,
                      color: theme.colors.primary.contrast,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        Buscar Certificado
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Tela de Busca por CPF */}
            {searchMode === 'cpf' && (
              <motion.div
                key="cpf"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleBackToSelection}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <h4 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                    Buscar por CPF
                  </h4>
                </div>

                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="cpfLastDigits"
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Últimos 3 Dígitos do CPF
                    </label>
                    <div className="relative">
                      <User 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                        style={{ color: theme.colors.text.tertiary }}
                      />
                      <input
                        id="cpfLastDigits"
                        name="cpfLastDigits"
                        type="text"
                        required
                        value={searchValues.cpfLastDigits}
                        onChange={handleSearchChange}
                        onBlur={handleSearchBlur}
                        className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                          searchTouched.cpfLastDigits && searchErrors.cpfLastDigits
                            ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-2 focus:ring-2'
                        }`}
                        style={{
                          backgroundColor: theme.colors.background.secondary,
                          borderColor: searchTouched.cpfLastDigits && searchErrors.cpfLastDigits 
                            ? theme.colors.status.error 
                            : theme.colors.border.DEFAULT,
                          color: theme.colors.text.primary,
                        }}
                        placeholder="000"
                        maxLength={3}
                      />
                      {searchTouched.cpfLastDigits && searchErrors.cpfLastDigits && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm flex items-center gap-1"
                          style={{ color: theme.colors.status.error }}
                        >
                          <span className="material-symbols-outlined text-base">error</span>
                          {searchErrors.cpfLastDigits}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: theme.colors.primary.DEFAULT,
                      color: theme.colors.primary.contrast,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        Buscar Certificado
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensagem de Erro */}
          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg border"
              style={{
                backgroundColor: theme.colors.status.error + '10',
                borderColor: theme.colors.status.error,
                color: theme.colors.status.error
              }}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                <span className="font-medium">Erro na busca</span>
              </div>
              <p className="mt-1 text-sm">{searchError}</p>
            </motion.div>
          )}

          {/* Resultados da Busca */}
          {certificates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <h4 
                className="font-semibold text-lg mb-4 flex items-center gap-2"
                style={{ color: theme.colors.text.primary }}
              >
                <Award className="h-5 w-5" />
                Certificados Encontrados ({certificates.length})
              </h4>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {certificates.map((certificate, index) => (
                  <motion.div
                    key={certificate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: theme.colors.background.secondary,
                      borderColor: theme.colors.border.light
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 
                          className="font-semibold text-lg"
                          style={{ color: theme.colors.text.primary }}
                        >
                          {certificate.document || certificate.license_code || `Certificado #${certificate.id}`}
                        </h5>
                        
                        {certificate.tv_show_name && (
                          <p 
                            className="text-sm mt-1"
                            style={{ color: theme.colors.text.secondary }}
                          >
                            {certificate.tv_show_name}
                          </p>
                        )}

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4" style={{ color: theme.colors.text.tertiary }} />
                            <span style={{ color: theme.colors.text.secondary }}>
                              {certificate.user?.full_name || 'Nome não disponível'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" style={{ color: theme.colors.text.tertiary }} />
                            <span style={{ color: theme.colors.text.secondary }}>
                              Emitido em: {formatDate(certificate.date_created)}
                            </span>
                          </div>

                          {certificate.score && (
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="h-4 w-4" style={{ color: theme.colors.text.tertiary }} />
                              <span style={{ color: theme.colors.text.secondary }}>
                                Pontuação: {certificate.score}
                              </span>
                            </div>
                          )}

                          {certificate.license_code && (
                            <div className="flex items-center gap-2 text-sm">
                              <Badge className="h-4 w-4" style={{ color: theme.colors.text.tertiary }} />
                              <span style={{ color: theme.colors.text.secondary }}>
                                Licença: {certificate.license_code}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {certificate.path && (
                        <a
                          href={certificate.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Visualizar certificado"
                        >
                          <FileText className="h-5 w-5" style={{ color: theme.colors.primary.DEFAULT }} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex justify-end"
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.light
          }}
        >
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
            style={{
              backgroundColor: theme.colors.background.card,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.DEFAULT}`
            }}
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}