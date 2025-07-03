'use client'

import { useEffect, useRef } from 'react'
import { SystemUsageData } from '@/types/analytics'

interface SystemUsageChartProps {
  data: SystemUsageData[]
  height?: number
}

export default function SystemUsageChart({ data, height = 320 }: SystemUsageChartProps) {
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

    // Configurações
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Encontrar valores máximos
    const maxUsers = Math.max(...data.map(d => d.activeUsers))
    const maxCpu = Math.max(...data.map(d => d.cpuUsage))

    // Função para converter valores em coordenadas
    const xScale = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth
    const yScaleUsers = (value: number) => padding.top + chartHeight - (value / maxUsers) * chartHeight
    const yScaleCpu = (value: number) => padding.top + chartHeight - (value / 100) * chartHeight

    // Desenhar grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    // Grid horizontal
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()
    }

    ctx.setLineDash([])

    // Desenhar linha de usuários ativos
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 2
    ctx.beginPath()
    data.forEach((point, index) => {
      const x = xScale(index)
      const y = yScaleUsers(point.activeUsers)
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Desenhar linha de CPU
    ctx.strokeStyle = '#10B981'
    ctx.beginPath()
    data.forEach((point, index) => {
      const x = xScale(index)
      const y = yScaleCpu(point.cpuUsage)
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Desenhar pontos
    data.forEach((point, index) => {
      const x = xScale(index)
      
      // Ponto usuários
      ctx.fillStyle = '#3B82F6'
      ctx.beginPath()
      ctx.arc(x, yScaleUsers(point.activeUsers), 3, 0, Math.PI * 2)
      ctx.fill()

      // Ponto CPU
      ctx.fillStyle = '#10B981'
      ctx.beginPath()
      ctx.arc(x, yScaleCpu(point.cpuUsage), 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Desenhar labels do eixo Y
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    // Labels usuários (esquerda)
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((maxUsers / 4) * (4 - i))
      const y = padding.top + (chartHeight / 4) * i
      ctx.fillText(value.toString(), padding.left - 10, y)
    }

    // Labels CPU (direita)
    ctx.textAlign = 'left'
    for (let i = 0; i <= 4; i++) {
      const value = Math.round((100 / 4) * (4 - i))
      const y = padding.top + (chartHeight / 4) * i
      ctx.fillText(`${value}%`, padding.left + chartWidth + 10, y)
    }

    // Labels do eixo X (horas)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const step = Math.floor(data.length / 6)
    data.forEach((point, index) => {
      if (index % step === 0 || index === data.length - 1) {
        const x = xScale(index)
        const hour = point.timestamp.getHours()
        ctx.fillText(`${hour}:00`, x, padding.top + chartHeight + 10)
      }
    })

    // Legenda
    const legendY = rect.height - 15
    ctx.font = '11px sans-serif'
    
    // Usuários ativos
    ctx.fillStyle = '#3B82F6'
    ctx.fillRect(rect.width / 2 - 100, legendY - 8, 12, 12)
    ctx.fillStyle = '#374151'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('Usuários Ativos', rect.width / 2 - 85, legendY - 2)

    // CPU
    ctx.fillStyle = '#10B981'
    ctx.fillRect(rect.width / 2 + 20, legendY - 8, 12, 12)
    ctx.fillStyle = '#374151'
    ctx.fillText('CPU (%)', rect.width / 2 + 35, legendY - 2)

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