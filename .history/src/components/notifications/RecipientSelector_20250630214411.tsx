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
  const [inputMode, setInputMode] = useState<'selector' | 'text'>('selector')
  const [textAreaValue, setTextAreaValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
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
      const email = inputValue.trim()
      
      if (emailRegex.test(email)) {
        // Verificar se o email já não foi adicionado
        if (!recipients.includes(email)) {
          onRecipientsChange([...recipients, email])
          setInputValue('')
          console.log('✅ [RecipientSelector] Email adicionado:', email)
        } else {
          console.warn('⚠️ [RecipientSelector] Email já adicionado:', email)
        }
      } else {
        console.warn('⚠️ [RecipientSelector] Email inválido:', email)
        // Você pode adicionar um estado para mostrar erro visual aqui
      }
    } else if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      // Remover último recipient ao pressionar backspace com input vazio
      removeRecipient(recipients[recipients.length - 1])
    }
  }

  const getRecipientInfo = (email: string): Recipient | undefined => {
    return availableRecipients.find(r => r.email === email)
  }

  const handleTextAreaChange = (value: string) => {
    setTextAreaValue(value)
    
    // Extrair emails do texto
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g
    const extractedEmails = value.match(emailRegex) || []
    
    // Remover duplicatas e emails já existentes
    const uniqueEmails = Array.from(new Set(extractedEmails)).filter(email =>
      !recipients.includes(email)
    )
    
    // Atualizar lista de destinatários se houver emails válidos
    if (uniqueEmails.length > 0) {
      onRecipientsChange([...recipients, ...uniqueEmails])
    }
  }

  const handleTextAreaBlur = () => {
    // Processar emails finais quando sair do campo
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g
    const extractedEmails = textAreaValue.match(emailRegex) || []
    
    if (extractedEmails.length > 0) {
      const validEmails = extractedEmails.filter(email => {
        const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailValidationRegex.test(email) && !recipients.includes(email)
      })
      
      if (validEmails.length > 0) {
        onRecipientsChange([...recipients, ...validEmails])
        setTextAreaValue('') // Limpar textarea após processar
      }
    }
  }

  const switchToTextMode = () => {
    setInputMode('text')
    setShowSuggestions(false)
    setTimeout(() => textAreaRef.current?.focus(), 100)
  }

  const switchToSelectorMode = () => {
    setInputMode('selector')
    setTextAreaValue('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="relative">
      {/* Seletor de modo */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={switchToSelectorMode}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            inputMode === 'selector'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">search</span>
          Seletor
        </button>
        <button
          type="button"
          onClick={switchToTextMode}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
            inputMode === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">text_fields</span>
          Texto Livre
        </button>
      </div>

      <div className="min-h-[120px] p-3 border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <div className="flex flex-wrap gap-2 mb-2">
          {recipients.map((email) => {
            const recipientInfo = getRecipientInfo(email)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            const isValidEmail = emailRegex.test(email)
            
            return (
              <div
                key={email}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  isValidEmail
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
              >
                {recipientInfo?.avatar ? (
                  <img
                    src={recipientInfo.avatar}
                    alt={recipientInfo.name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <span className="material-symbols-outlined text-sm">
                    {!isValidEmail ? 'error' : recipientInfo?.type === 'group' ? 'group' : 'person'}
                  </span>
                )}
                <span className="font-medium">
                  {recipientInfo?.name || email}
                </span>
                {!isValidEmail && (
                  <span className="text-xs bg-red-200 px-1 rounded">
                    Inválido
                  </span>
                )}
                <button
                  onClick={() => removeRecipient(email)}
                  className={`ml-1 ${isValidEmail ? 'hover:text-blue-900' : 'hover:text-red-900'}`}
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )
          })}
        </div>
        {inputMode === 'selector' ? (
          <>
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
            {recipients.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {recipients.length} destinatário(s) selecionado(s). Pressione Enter para adicionar emails manualmente.
              </div>
            )}
          </>
        ) : (
          <>
            <textarea
              ref={textAreaRef}
              value={textAreaValue}
              onChange={(e) => handleTextAreaChange(e.target.value)}
              onBlur={handleTextAreaBlur}
              placeholder="Digite ou cole emails separados por vírgula, espaço ou quebra de linha:&#10;exemplo@email.com, outro@email.com&#10;terceiro@email.com"
              className="w-full outline-none text-sm resize-none min-h-[60px]"
              rows={3}
            />
            <div className="mt-2 text-xs text-gray-500">
              Cole uma lista de emails ou digite separados por vírgula, espaço ou quebra de linha.
              {recipients.length > 0 && ` ${recipients.length} destinatário(s) já adicionado(s).`}
            </div>
          </>
        )}
      </div>

      {/* Dropdown de sugestões - apenas no modo seletor */}
      {showSuggestions && inputMode === 'selector' && (
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
