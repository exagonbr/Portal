'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeContext'

interface NavigationLoadingContextType {
  isLoading: boolean
  showLoading: (message?: string) => void
  hideLoading: () => void
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined)

export const useNavigationLoading = () => {
  const context = useContext(NavigationLoadingContext)
  if (!context) {
    throw new Error('useNavigationLoading deve ser usado dentro de NavigationLoadingProvider')
  }
  return context
}

interface NavigationLoadingProviderProps {
  children: ReactNode
}

export const NavigationLoadingProvider = ({ children }: NavigationLoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Estamos preparando tudo para você')
  const { theme } = useTheme()

  const showLoading = useCallback((customMessage?: string) => {
    setMessage(customMessage || 'Estamos preparando tudo para você')
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              backgroundColor: theme?.colors?.background?.primary ? 
                `${theme.colors.background.primary}f0` : 'rgba(249, 250, 251, 0.94)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center p-8 rounded-2xl shadow-2xl max-w-md mx-4"
              style={{
                backgroundColor: theme?.colors?.background?.card || '#ffffff',
                border: `1px solid ${theme?.colors?.border?.DEFAULT || '#e5e7eb'}`
              }}
            >
              {/* Loading Animation */}
              <div className="relative mb-8">
                {/* Outer Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: theme?.colors?.primary?.DEFAULT || '#3b82f6',
                    borderRightColor: theme?.colors?.primary?.light || '#60a5fa'
                  }}
                />
                
                {/* Inner Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent"
                  style={{
                    borderBottomColor: theme?.colors?.primary?.DEFAULT || '#3b82f6',
                    borderLeftColor: theme?.colors?.primary?.light || '#60a5fa'
                  }}
                />
                
                {/* Center Dot */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme?.colors?.primary?.DEFAULT || '#3b82f6' }}
                  />
                </motion.div>
              </div>

              {/* Loading Text */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-center"
              >
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: theme?.colors?.text?.primary || '#111827' }}
                >
                  {message}
                </h3>
                
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center space-x-1"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme?.colors?.primary?.DEFAULT || '#3b82f6' }}
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme?.colors?.primary?.DEFAULT || '#3b82f6' }}
                  />
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme?.colors?.primary?.DEFAULT || '#3b82f6' }}
                  />
                </motion.div>
                
                <p
                  className="text-sm mt-4 opacity-75"
                  style={{ color: theme?.colors?.text?.secondary || '#6b7280' }}
                >
                  Aguarde um momento...
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </NavigationLoadingContext.Provider>
  )
}