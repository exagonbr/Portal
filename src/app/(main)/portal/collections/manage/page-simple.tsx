'use client'

import React, { useState, useEffect } from 'react'

export default function SimpleCollectionsManagePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collections, setCollections] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/tv-shows?page=1&limit=5')
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          setCollections(data.data?.tvShows || [])
        } else {
          setError(data.message || 'Erro ao carregar dados')
        }
      } catch (err) {
        console.log('Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Coleções</h1>
        <p>Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Coleções</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Coleções</h1>
      
      <div className="mb-4">
        <p>Total de coleções: {collections.length}</p>
      </div>

      <div className="grid gap-4">
        {collections.map((collection) => (
          <div key={collection.id} className="border p-4 rounded">
            <h3 className="font-semibold">{collection.name}</h3>
            <p className="text-sm text-gray-600">
              Vídeos: {collection.video_count || 0}
            </p>
            {collection.overview && (
              <p className="text-sm mt-2">{collection.overview.substring(0, 100)}...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 