'use client'

import { useState } from 'react'
import QuillEditor from '../../components/common/QuillEditor'

export default function TestQuillPage() {
  const [content, setContent] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Teste do QuillEditor
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Editor de Texto Rico
          </h2>
          
          <div className="mb-6">
            <QuillEditor
              value={content}
              onChange={setContent}
              placeholder="Digite algo aqui para testar o editor..."
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Conteúdo HTML:
            </h3>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
              {content || 'Nenhum conteúdo ainda...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}