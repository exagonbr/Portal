'use client'

import { S3StorageInfo } from '@/services/awsService'

interface S3StorageAnalyticsProps {
  data: S3StorageInfo | null
  bucketName?: string
  region?: string
}

export default function S3StorageAnalytics({ data, bucketName, region }: S3StorageAnalyticsProps) {
  if (!data) {
    return (
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-2">📦</div>
        <p>S3 não configurado</p>
        <p className="text-sm mt-1">Configure o bucket S3 nas configurações</p>
      </div>
    )
  }

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(2)} GB`
    }
    return `${sizeInMB.toFixed(2)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Métricas principais */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Tamanho Total</p>
          <p className="text-xl font-bold text-primary">{data.bucketSize.toFixed(2)} GB</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Arquivos</p>
          <p className="text-xl font-bold text-primary">{data.objectCount.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Custo Mensal</p>
          <p className="text-lg font-semibold text-green-600">${data.monthlyCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Última Modificação</p>
          <p className="text-sm text-gray-700">{data.lastModified.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Distribuição por tipo de arquivo */}
      {data.fileTypeDistribution && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Distribuição por Tipo de Arquivo</h4>
          <div className="space-y-2">
            {data.fileTypeDistribution.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{item.fileType}</span>
                  <span className="text-sm text-gray-700">
                    {item.count} arquivos • {formatFileSize(item.size)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: getColorForFileType(item.fileType)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informações do bucket */}
      <div className="bg-gray-50 p-3 rounded-lg mt-4">
        <p className="text-xs text-gray-600 mb-1">Bucket: {bucketName}</p>
        <p className="text-xs text-gray-600">Região: {region}</p>
      </div>

      {/* Métricas adicionais */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-xs text-blue-600">Taxa de Upload</div>
          <div className="text-sm font-semibold text-blue-700">2.5 GB/dia</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="text-xs text-green-600">Downloads</div>
          <div className="text-sm font-semibold text-green-700">1.2k/dia</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <div className="text-xs text-purple-600">Economia</div>
          <div className="text-sm font-semibold text-purple-700">15%</div>
        </div>
      </div>
    </div>
  )
}

function getColorForFileType(fileType: string): string {
  const colors: Record<string, string> = {
    'PDF': '#EF4444',
    'Vídeos': '#3B82F6',
    'Imagens': '#10B981',
    'Documentos': '#F59E0B',
    'Outros': '#8B5CF6'
  }
  return colors[fileType] || '#6B7280'
} 