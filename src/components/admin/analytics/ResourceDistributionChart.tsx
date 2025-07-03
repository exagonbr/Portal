'use client'

import { useEffect, useRef } from 'react'
import { ResourceDistribution } from '@/types/analytics'

interface ResourceDistributionChartProps {
  data: ResourceDistribution[]
  height?: number
}

export default function ResourceDistributionChart({ data, height = 320 }: ResourceDistributionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar dimensões
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Limpar canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Configurações do gráfico
    const centerX = rect.width / 2
    const centerY = rect.height / 2 - 20
    const radius = Math.min(rect.width, rect.height - 40) / 3

    // Desenhar gráfico de pizza
    let currentAngle = -Math.PI / 2 // Começar do topo

    data.forEach((item, index) => {
      const sliceAngle = (item.percentage / 100) * Math.PI * 2

      // Desenhar fatia
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()

      // Desenhar borda
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Calcular posição do texto
      const textAngle = currentAngle + sliceAngle / 2
      const textX = centerX + Math.cos(textAngle) * (radius * 0.7)
      const textY = centerY + Math.sin(textAngle) * (radius * 0.7)

      // Desenhar porcentagem
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${item.percentage}%`, textX, textY)

      currentAngle += sliceAngle
    })

    // Desenhar legenda
    const legendStartY = centerY + radius + 40
    const legendItemHeight = 20
    const legendStartX = rect.width / 2 - 150

    data.forEach((item, index) => {
      const y = legendStartY + index * legendItemHeight

      // Quadrado colorido
      ctx.fillStyle = item.color
      ctx.fillRect(legendStartX, y - 8, 16, 16)

      // Texto da legenda
      ctx.fillStyle = '#374151'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${item.category} (${item.value}%)`, legendStartX + 25, y)
    })

    // Título do gráfico
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Distribuição de Recursos AWS', centerX, 10)

  }, [data])

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ height: `${height}px` }}
      />
    </div>
  )
} 