'use client'

import { forwardRef, useLayoutEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// Importar ReactQuill dinamicamente para evitar SSR
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    
    // Wrapper para evitar o erro de findDOMNode
    const QuillWrapper = forwardRef<any, any>(({ forwardedRef, ...props }, ref) => {
      const quillRef = useRef<any>(null)

      useLayoutEffect(() => {
        if (forwardedRef) {
          forwardedRef.current = quillRef.current
        }
      }, [forwardedRef])

      return <RQ ref={quillRef} {...props} />
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