'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = ''
}) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || '')

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleTabChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue)
    }
    onValueChange?.(newValue)
  }

  const contextValue = React.useMemo(() => ({
    value: activeTab,
    onValueChange: handleTabChange
  }), [activeTab])

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className = ''
}) => {
  const { theme } = useTheme()

  return (
    <div 
      className={`flex space-x-2 rounded-lg p-1 ${className}`}
      style={{ backgroundColor: theme.colors.background.secondary }}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
  disabled = false
}) => {
  const { theme } = useTheme()
  const { value: activeValue, onValueChange } = React.useContext(TabsContext)
  const isActive = activeValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={`
        px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
        ${isActive ? 'shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        backgroundColor: isActive ? theme.colors.background.primary : 'transparent',
        color: isActive ? theme.colors.primary.DEFAULT : theme.colors.text.secondary
      }}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = ''
}) => {
  const { value: activeValue } = React.useContext(TabsContext)
  const isActive = activeValue === value

  if (!isActive) return null

  return (
    <div 
      role="tabpanel"
      className={`mt-2 ${className}`}
    >
      {children}
    </div>
  )
}

// Context para gerenciar o estado das abas
interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({
  value: '',
  onValueChange: () => {}
}) 