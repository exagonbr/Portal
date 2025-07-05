'use client'

import { useState } from 'react'
import QuillEditor from '@/components/common/QuillEditor'

export default function TestQuillPage() {
  const [content, setContent] = useState('<p>Digite aqui para testar o editor...</p>')

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Teste do QuillEditor - React 18 Compatibility
          </h1>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Este é um teste para verificar se o QuillEditor está funcionando corretamente com React 18 strict mode.
              Se você não vir erros de findDOMNode no console, a correção foi bem-sucedida.
            </p>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <QuillEditor
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Digite sua mensagem aqui para testar..."
              style={{ minHeight: '300px' }}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Conteúdo HTML:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-40">
              {content}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-green-800 font-semibold mb-2">✅ Verificações de Compatibilidade:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• React Strict Mode: Habilitado</li>
              <li>• findDOMNode patch: Removido</li>
              <li>• Ref forwarding: Simplificado para React 18</li>
              <li>• Dynamic import: Mantido para SSR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
