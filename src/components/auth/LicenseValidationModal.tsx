'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from '../../hooks/useForm';
import { useTheme } from '@/contexts/ThemeContext';

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
    if (!value) return 'Os 4 últimos dígitos do CPF são obrigatórios';
    if (!/^\d{4}$/.test(value)) return 'Deve conter exatamente 4 dígitos';
    return '';
  }
};

interface LicenseValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LicenseValidationModal({ isOpen, onClose }: LicenseValidationModalProps) {
  const { theme } = useTheme();
  const [searchFormKey, setSearchFormKey] = useState(0);

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
        console.log('Dados de busca:', formValues);
        // Lógica de busca da licença aqui
        alert(`Buscando por Licença: ${formValues.numeroLicenca}, CPF final: ${formValues.cpfLastDigits}`);
        handleClose();
      } catch (error) {
        console.error('Erro durante a busca:', error);
      }
    }
  });

  const handleClose = () => {
    resetForm();
    setSearchFormKey(prev => prev + 1);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 backdrop-blur-sm transition-opacity"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          aria-hidden="true"
          onClick={handleClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          style={{
            backgroundColor: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.DEFAULT}`
          }}
        >
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3
                  className="text-lg leading-6 font-medium mb-4"
                  id="modal-title"
                  style={{ color: theme.colors.text.primary }}
                >
                  Validar Licença
                </h3>

                <form onSubmit={handleSearchSubmit} className="space-y-4" key={searchFormKey}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label
                      htmlFor="numeroLicenca"
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Número da Licença
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-xl"
                        style={{ color: theme.colors.text.tertiary }}
                      >
                        badge
                      </span>
                      <input
                        id="numeroLicenca"
                        name="numeroLicenca"
                        type="text"
                        required
                        value={searchValues.numeroLicenca}
                        onChange={handleSearchChange}
                        onBlur={handleSearchBlur}
                        aria-invalid={searchTouched.numeroLicenca && searchErrors.numeroLicenca ? 'true' : 'false'}
                        aria-describedby={searchTouched.numeroLicenca && searchErrors.numeroLicenca ? 'numeroLicenca-error' : undefined}
                        className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${searchTouched.numeroLicenca && searchErrors.numeroLicenca
                            ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-2 focus:ring-2'
                          }`}
                        style={{
                          backgroundColor: theme.colors.background.secondary,
                          borderColor: searchTouched.numeroLicenca && searchErrors.numeroLicenca ? theme.colors.status.error : theme.colors.border.DEFAULT,
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
                          id="numeroLicenca-error"
                          role="alert"
                        >
                          <span className="material-symbols-outlined text-base">error</span>
                          {searchErrors.numeroLicenca}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label
                      htmlFor="cpfLastDigits"
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Últimos 4 Dígitos do CPF
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-xl"
                        style={{ color: theme.colors.text.tertiary }}
                      >
                        pin
                      </span>
                      <input
                        id="cpfLastDigits"
                        name="cpfLastDigits"
                        type="text"
                        required
                        value={searchValues.cpfLastDigits}
                        onChange={handleSearchChange}
                        onBlur={handleSearchBlur}
                        aria-invalid={searchTouched.cpfLastDigits && searchErrors.cpfLastDigits ? 'true' : 'false'}
                        aria-describedby={searchTouched.cpfLastDigits && searchErrors.cpfLastDigits ? 'cpfLastDigits-error' : undefined}
                        className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${searchTouched.cpfLastDigits && searchErrors.cpfLastDigits
                            ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-2 focus:ring-2'
                          }`}
                        style={{
                          backgroundColor: theme.colors.background.secondary,
                          borderColor: searchTouched.cpfLastDigits && searchErrors.cpfLastDigits ? theme.colors.status.error : theme.colors.border.DEFAULT,
                          color: theme.colors.text.primary,
                        }}
                        placeholder="0000"
                        maxLength={4}
                      />
                      {searchTouched.cpfLastDigits && searchErrors.cpfLastDigits && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm flex items-center gap-1"
                          style={{ color: theme.colors.status.error }}
                          id="cpfLastDigits-error"
                          role="alert"
                        >
                          <span className="material-symbols-outlined text-base">error</span>
                          {searchErrors.cpfLastDigits}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                </form>
              </div>
            </div>
          </div>

          <div
            className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t"
            style={{
              backgroundColor: theme.colors.background.secondary,
              borderColor: theme.colors.border.light
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleSearchSubmit}
              disabled={isSearchSubmitting}
              className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                backgroundColor: theme.colors.primary.DEFAULT,
                color: theme.colors.primary.contrast,
                boxShadow: theme.shadows.md
              }}
            >
              {isSearchSubmitting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined mr-2"
                  >
                    progress_activity
                  </motion.span>
                  Buscando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2">search</span>
                  Buscar
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
              style={{
                backgroundColor: theme.colors.background.card,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.DEFAULT}`
              }}
            >
              <span className="material-symbols-outlined mr-2">close</span>
              Cancelar
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}