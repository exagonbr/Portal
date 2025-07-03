'use client'

import { forwardRef, useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Polyfill mais robusto para findDOMNode no React 18
if (typeof window !== 'undefined') {
  // Aguardar o ReactDOM estar disponível
  const setupPolyfill = () => {
    try {
      const ReactDOM = require('react-dom')
      
      // Backup do método original se existir
      const originalFindDOMNode = ReactDOM.findDOMNode
      
      // Implementar polyfill apenas se necessário
      if (!ReactDOM.findDOMNode || typeof ReactDOM.findDOMNode !== 'function') {
        ReactDOM.findDOMNode = (component: any) => {
          // Se é um elemento DOM direto
          if (component && component.nodeType === 1) {
            return component
          }
          
          // Se é um componente React com ref
          if (component && component.current && component.current.nodeType === 1) {
            return component.current
          }
          
          // Tentar acessar o nó DOM através das propriedades internas do React
          if (component && typeof component === 'object') {
            // React 18 Fiber
            if (component._reactInternalFiber?.stateNode) {
              return component._reactInternalFiber.stateNode
            }
            
            // React 17 e anteriores
            if (component._reactInternalInstance?.stateNode) {
              return component._reactInternalInstance.stateNode
            }
            
            // Outras tentativas
            if (component.stateNode) {
              return component.stateNode
            }
          }
          
          // Fallback para método original se existir
          if (originalFindDOMNode && typeof originalFindDOMNode === 'function') {
            try {
              return originalFindDOMNode(component)
            } catch (e) {
              console.warn('Fallback findDOMNode failed:', e)
            }
          }
          
          return null
        }
      }
    } catch (error) {
      console.warn('Erro ao configurar polyfill findDOMNode:', error)
    }
  }
  
  // Configurar polyfill imediatamente
  setupPolyfill()
}

// Importar ReactQuill dinamicamente para evitar SSR
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    
    // Wrapper compatível com React 18
    const QuillWrapper = forwardRef<any, any>((props, ref) => {
      const { forwardedRef, ...otherProps } = props
      const containerRef = useRef<HTMLDivElement>(null)
      const quillRef = useRef<any>(null)
      const [isReady, setIsReady] = useState(false)

      // Callback ref unificado para React 18
      const setRef = useCallback((node: any) => {
        quillRef.current = node
        
        // Atualizar todas as refs
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else {
            forwardedRef.current = node
          }
        }
        
        if (ref) {
          if (typeof ref === 'function') {
            ref(node)
          } else {
            ref.current = node
          }
        }
        
        // Marcar como pronto quando o ref for definido
        if (node) {
          setIsReady(true)
        }
      }, [forwardedRef, ref])

      // Garantir que o Quill seja inicializado corretamente
      useEffect(() => {
        if (isReady && containerRef.current && quillRef.current) {
          const editor = containerRef.current.querySelector('.ql-editor')
          if (editor) {
            // Quill inicializado com sucesso
            console.log('Quill editor inicializado com sucesso')
          }
        }
      }, [isReady])

      return (
        <div ref={containerRef} className="quill-container">
          <RQ ref={setRef} {...otherProps} />
        </div>
      )
    })
    
    QuillWrapper.displayName = 'QuillWrapper'
    return QuillWrapper
  },
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Carregando editor...</span>
    </div>
  }
)

import 'react-quill/dist/quill.snow.css'
import '../../styles/quill-custom.css'

interface QuillEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  modules?: any
  theme?: string
  style?: React.CSSProperties
  className?: string
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = 'Digite sua mensagem aqui...',
  modules,
  theme = 'snow',
  style,
  className = 'bg-white'
}: QuillEditorProps) {
  const quillRef = useRef<any>(null)

  return (
    <ReactQuill
      forwardedRef={quillRef}
      theme={theme}
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder}
      className={className}
      style={style}
    />
  )
}
