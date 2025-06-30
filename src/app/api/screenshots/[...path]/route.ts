import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'


// Função para gerar SVG de placeholder mais realista
function generatePlaceholderSVG(width: number, height: number, label: string, formFactor: 'wide' | 'narrow') {
  const backgroundColor = formFactor === 'wide' ? '#0f3460' : '#1e40af'
  const secondaryColor = formFactor === 'wide' ? '#1e40af' : '#3b82f6'
  const textColor = '#ffffff'
  const accentColor = '#60a5fa'
  
  // Elementos de UI simulados
  const headerHeight = formFactor === 'wide' ? 80 : 60
  const sidebarWidth = formFactor === 'wide' ? 250 : 0
  const cardWidth = formFactor === 'wide' ? 300 : width - 40
  const cardHeight = formFactor === 'wide' ? 200 : 150
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="100%" height="${headerHeight}" fill="rgba(255,255,255,0.1)"/>
      <text x="20" y="${headerHeight/2 + 6}" fill="${textColor}" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
        Portal Sabercon
      </text>
      
      ${formFactor === 'wide' ? `
      <!-- Sidebar -->
      <rect x="0" y="${headerHeight}" width="${sidebarWidth}" height="${height - headerHeight}" fill="rgba(0,0,0,0.2)"/>
      <rect x="20" y="${headerHeight + 20}" width="210" height="40" rx="8" fill="rgba(255,255,255,0.1)"/>
      <rect x="20" y="${headerHeight + 80}" width="210" height="30" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="20" y="${headerHeight + 120}" width="210" height="30" rx="4" fill="rgba(255,255,255,0.05)"/>
      ` : ''}
      
      <!-- Main Content Area -->
      <g transform="translate(${formFactor === 'wide' ? sidebarWidth + 20 : 20}, ${headerHeight + 20})">
        <!-- Cards -->
        <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" rx="12" fill="rgba(255,255,255,0.1)" filter="url(#shadow)"/>
        <rect x="20" y="20" width="${cardWidth - 40}" height="30" rx="4" fill="${accentColor}"/>
        <rect x="20" y="70" width="${cardWidth - 80}" height="20" rx="2" fill="rgba(255,255,255,0.7)"/>
        <rect x="20" y="100" width="${cardWidth - 120}" height="20" rx="2" fill="rgba(255,255,255,0.5)"/>
        
        ${formFactor === 'wide' ? `
        <rect x="${cardWidth + 20}" y="0" width="${cardWidth}" height="${cardHeight}" rx="12" fill="rgba(255,255,255,0.1)" filter="url(#shadow)"/>
        <rect x="${cardWidth + 40}" y="20" width="${cardWidth - 40}" height="30" rx="4" fill="${accentColor}"/>
        <rect x="${cardWidth + 40}" y="70" width="${cardWidth - 80}" height="20" rx="2" fill="rgba(255,255,255,0.7)"/>
        <rect x="${cardWidth + 40}" y="100" width="${cardWidth - 120}" height="20" rx="2" fill="rgba(255,255,255,0.5)"/>
        ` : ''}
      </g>
      
      <!-- Title and Description -->
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" opacity="0.9">
        ${label}
      </text>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="14" opacity="0.7">
        ${width}x${height} - ${formFactor === 'wide' ? 'Desktop' : 'Mobile'} Preview
      </text>
      
      <!-- Decorative elements -->
      <circle cx="${width - 50}" cy="50" r="20" fill="${accentColor}" opacity="0.3"/>
      <circle cx="${width - 100}" cy="100" r="15" fill="rgba(255,255,255,0.2)"/>
    </svg>
  `.trim()
}

// Configurações dos screenshots
const screenshots = {
  'desktop-home.png': {
    width: 1920,
    height: 1080,
    label: 'Página inicial do Portal Sabercon',
    formFactor: 'wide' as const
  },
  'mobile-home.png': {
    width: 390,
    height: 844,
    label: 'Portal Sabercon no celular',
    formFactor: 'narrow' as const
  },
  'desktop-dashboard.png': {
    width: 1920,
    height: 1080,
    label: 'Dashboard do Portal Sabercon',
    formFactor: 'wide' as const
  },
  'mobile-dashboard.png': {
    width: 390,
    height: 844,
    label: 'Dashboard mobile',
    formFactor: 'narrow' as const
  }
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const path = resolvedParams.path.join('/')
    
    // Verificar se o arquivo solicitado existe na configuração
    if (!(filename in screenshots)) {
      return NextResponse.json({ error: 'Screenshot não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const config = screenshots[filename as keyof typeof screenshots]
    
    // Gerar SVG de placeholder
    const svgContent = generatePlaceholderSVG(
      config.width,
      config.height,
      config.label,
      config.formFactor
    )

    // Determinar o tipo de conteúdo baseado na extensão solicitada
    const isRequestingPNG = filename.endsWith('.png')
    
    if (isRequestingPNG) {
      // Para PNG, retornamos SVG mas com headers que indicam que é uma imagem
      return new NextResponse(svgContent, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } else {
      // Para outros formatos, retornar SVG normalmente
      return new NextResponse(svgContent, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

  } catch (error) {
    console.error('Erro ao servir screenshot:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 