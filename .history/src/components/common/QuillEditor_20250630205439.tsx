'use client'

import { forwardRef, useLayoutEffect, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Patch para ReactDOM.findDOMNode - compatibilidade com React 18
if (typeof window !== 'undefined') {
  const ReactDOM = require('react-dom')
  if (ReactDOM.findDOMNode) {
    const originalFindDOMNode = ReactDOM.findDOMNode
    ReactDOM.findDOMNode = function(component: any) {
      if (component && component.current) {
        return component.current
      }
      if (component && typeof component === 'object' && component.nodeType) {
        return component
      }
      try {
        return originalFindDOMNode(component)
      } catch (error) {
        console.warn('findDOMNode fallback:', error)
        return null
      }
    }
  }
}

// Importar ReactQuill dinamicamente para evitar SSR
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    
    // Wrapper compatível com React 18 - evita problemas com findDOMNode
    const QuillWrapper = forwardRef<any, any>((props, ref) => {
      const { forwardedRef, ...otherProps } = props
      const quillRef = useRef<any>(null)
      const containerRef = useRef<HTMLDivElement>(null)

      // Callback ref que funciona com React 18
      const setQuillRef = useCallback((node: any) => {
        quillRef.current = node
        
        // Propagar ref para forwardedRef se fornecido
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else {
            forwardedRef.current = node
          }
        }
        
        // Propagar ref padrão se fornecido
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }, [forwardedRef, ref])

      // Garantir que o Quill seja inicializado corretamente
      useEffect(() => {
        if (quillRef.current && containerRef.current) {
          const quillInstance = quillRef.current.getEditor?.()
          if (quillInstance && containerRef.current.querySelector('.ql-editor')) {
            // Quill inicializado com sucesso
          }
        }
      }, [])

      return (
        <div ref={containerRef} className="quill-container">
          <RQ ref={setQuillRef} {...otherProps} />
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