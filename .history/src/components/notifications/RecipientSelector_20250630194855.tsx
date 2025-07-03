'use client'

import { useState, useRef, useEffect } from 'react'

interface Recipient {
  id: string
  name: string
  email: string
  type: 'user' | 'group' | 'role'
  avatar?: string
}

interface RecipientSelectorProps {
  recipients: string[]
  onRecipientsChange: (recipients: string[]) => void
  availableRecipients: Recipient[]
  placeholder?: string
}

export default function RecipientSelector({
  recipients,
  onRecipientsChange,
  availableRecipients,
  placeholder = "Digite o nome ou e-mail do destinatário"
}: RecipientSelectorProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Recipient[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filtrar sugestões baseado no input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableRecipients.filter(recipient => 
        !recipients.includes(recipient.email) && (
          recipient.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          recipient.email.toLowerCase().includes(inputValue.toLowerCase())
        )
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, availableRecipients, recipients])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addRecipient = (recipient: Recipient) => {
    onRecipientsChange([...recipients, recipient.email])
    setInputValue('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeRecipient = (email: string) => {
    onRecipientsChange(recipients.filter(r => r !== email))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      // Verificar se é um email válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(inputValue.trim())) {
        onRecipientsChange([...recipients, inputValue.trim()])
        setInputValue('')
      }
    } else if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      // Remover último recipient ao pressionar backspace com input vazio
      removeRecipient(recipients[recipients.length - 1])
    }
  }

  const getRecipientInfo = (email: string): Recipient | undefined => {
    return availableRecipients.find(r => r.email === email)
  }

  return (
    <div className="relative">
      <div className="min-h-[120px] p-3 border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <div className="flex flex-wrap gap-2 mb-2">
          {recipients.map((email) => {
            const recipientInfo = getRecipientInfo(email)
            return (
              <div
                key={email}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {recipientInfo?.avatar ? (
                  <img 
                    src={recipientInfo.avatar} 
                    alt={recipientInfo.name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <span className="material-symbols-outlined text-sm">
                    {recipientInfo?.type === 'group' ? 'group' : 'person'}
                  </span>
                )}
                <span className="font-medium">
                  {recipientInfo?.name || email}
                </span>
                <button
                  onClick={() => removeRecipient(email)}
                  className="ml-1 hover:text-blue-900"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )
          })}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.trim() && setShowSuggestions(true)}
          placeholder={recipients.length === 0 ? placeholder : "Adicionar mais destinatários..."}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Dropdown de sugestões */}
      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((recipient) => (
            <button
              key={recipient.id}
              onClick={() => addRecipient(recipient)}
              className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left"
            >
              {recipient.avatar ? (
                <img 
                  src={recipient.avatar} 
                  alt={recipient.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-gray-600">
                    {recipient.type === 'group' ? 'group' : 'person'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{recipient.name}</p>
                <p className="text-sm text-gray-500">{recipient.email}</p>
              </div>
              {recipient.type === 'group' && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Grupo
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
