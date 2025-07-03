'use client'

import { useState } from 'react'
import QuillEditor from '@/components/common/QuillEditor'

export default function QuillTestPage() {
  const [content, setContent] = useState('<p>Teste do editor Quill...</p>')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Teste QuillEditor - React 18</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <QuillEditor
            value={content}
            onChange={setContent}
            placeholder="Digite aqui para testar..."
          />
        </div>
        
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Conteúdo:</h3>
          <pre className="text-sm">{content}</pre>
        </div>
      </div>
    </div>
  )
}