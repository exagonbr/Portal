'use client'

import { forwardRef, useLayoutEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Importar ReactQuill dinamicamente para evitar SSR
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    
    // Wrapper para evitar o erro de findDOMNode no React 18
    const QuillWrapper = forwardRef<any, any>((props, ref) => {
      const { forwardedRef, ...otherProps } = props
      const quillRef = useRef<any>(null)
      const containerRef = useRef<HTMLDivElement>(null)

      // Usar callback ref para evitar problemas com findDOMNode
      const setQuillRef = useCallback((node: any) => {
        quillRef.current = node
        if (forwardedRef) {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else {
            forwardedRef.current = node
          }
        }
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }, [forwardedRef, ref])

      // Suprimir avisos do findDOMNode temporariamente
      const originalError = console.error
      const suppressFindDOMNodeWarning = (...args: any[]) => {
        const message = args[0]
        if (typeof message === 'string' && message.includes('findDOMNode')) {
          return // Suprimir apenas avisos do findDOMNode
        }
        originalError.apply(console, args)
      }

      return (
        <div ref={containerRef} className="quill-wrapper">
          <RQ
            ref={setQuillRef}
            {...otherProps}
            onFocus={() => {
              console.error = suppressFindDOMNodeWarning
              otherProps.onFocus?.()
            }}
            onBlur={() => {
              console.error = originalError
              otherProps.onBlur?.()
            }}
          />
        </div>
      )
    })
    
    QuillWrapper.displayName = 'QuillWrapper'
    return QuillWrapper
  },
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />
  }
)

import 'react-quill/dist/quill.snow.css'

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