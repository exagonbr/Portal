'use client'

import React, { useState, useEffect } from 'react'
import { TVShowCollection, TVShowVideo, TVShowModuleStructure } from '@/types/collections'
import { Search, Filter, Clock, Play, Folder, Calendar, Star, Eye, BookOpen, FileText } from 'lucide-react'
import { formatDate, formatYear } from '@/utils/date'
// Importar o UniversalVideoPlayer em vez dos players customizados
import UniversalVideoPlayer from '@/components/UniversalVideoPlayer'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface TVShowListItem {
  id: number
  name: string
  producer?: string
  total_load?: string
  video_count?: number
  created_at?: string
  poster_path?: string
  backdrop_path?: string
  overview?: string
  popularity?: number
  vote_average?: number
  vote_count?: number
  first_air_date?: string
  contract_term_end?: string
  poster_image_url?: string
  backdrop_image_url?: string
}

interface StatsData {
  totalCollections: number
  totalVideos: number
  totalDuration: string
  avgRating: number
}

export default function TVShowsManagePage() {
  // Adicionar estilos CSS para animações
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [tvShows, setTvShows] = useState<TVShowListItem[]>([])
  const [selectedTvShow, setSelectedTvShow] = useState<TVShowCollection | null>(null)
  const [modules, setModules] = useState<TVShowModuleStructure>({})
  const [currentView, setCurrentView] = useState<'list' | 'videos'>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<StatsData>({
    totalCollections: 0,
    totalVideos: 0,
    totalDuration: '0h 0m',
    avgRating: 0
  })

  // Estados para filtros
  const [filters, setFilters] = useState({
    producer: '',
    minDuration: '',
    maxDuration: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'name' // name, date, duration, popularity
  })
  const [showFilters, setShowFilters] = useState(false)

  // Estados para o player universal - simplificados
  const [showUniversalPlayer, setShowUniversalPlayer] = useState(false)
  const [playerVideos, setPlayerVideos] = useState<any[]>([])
  const [playerCollectionName, setPlayerCollectionName] = useState<string>('')
  const [playerSessionNumber, setPlayerSessionNumber] = useState<number | undefined>(undefined)
  const [playerInitialIndex, setPlayerInitialIndex] = useState<number>(0)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set())

  // Função para construir URL do CloudFront - MELHORADA
  const buildVideoUrl = (sha256hex: string | null, extension: string | null): string | null => {
    if (!sha256hex || !extension) {
      console.log('⚠️ buildVideoUrl: sha256hex ou extension ausentes:', { sha256hex, extension })
      return null;
    }
    
    const cleanExtension = extension.toLowerCase().startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
    const url = `https://d26a2wm7tuz2gu.cloudfront.net/upload/${sha256hex}${cleanExtension}`;
    
    console.log('🔗 URL construída:', url)
    return url;
  }

  // Função para buscar dados do arquivo do vídeo baseado no ID
  const fetchVideoFileData = async (videoId: string): Promise<{sha256hex: string, extension: string} | null> => {
    try {
      console.log(`🔍 Iniciando busca de dados para vídeo ID: ${videoId}`)
      
      const token = getAuthToken();
      if (!token) {
        console.error('❌ Token de autenticação não encontrado - usuário não está logado');
        // Tentar redirecionar para login ou mostrar erro
        return null;
      }

      console.log(`🔗 Fazendo requisição para: /api/video-file/${videoId}`)
      
      const response = await fetch(`/api/video-file/${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📡 Resposta da API:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error(`❌ Erro 401 - Token inválido ou expirado para vídeo ${videoId}`);
          // Aqui poderia limpar o token e redirecionar para login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('token');
        } else if (response.status === 404) {
          console.error(`❌ Erro 404 - Arquivo não encontrado para vídeo ${videoId}`);
        } else {
          console.error(`❌ Erro ${response.status} ao buscar dados do arquivo do vídeo ${videoId}:`, response.statusText);
        }
        return null;
      }

      const data = await response.json();
      console.log(`✅ Dados do arquivo do vídeo ${videoId}:`, data);

      if (data.success && data.data && data.data.sha256hex && data.data.extension) {
        console.log(`✅ Dados válidos encontrados:`, {
          sha256hex: data.data.sha256hex,
          extension: data.data.extension
        })
        return {
          sha256hex: data.data.sha256hex,
          extension: data.data.extension
        };
      } else {
        console.warn(`⚠️ Dados incompletos recebidos para vídeo ${videoId}:`, data);
      }

      return null;
    } catch (error) {
      console.error(`❌ Erro na requisição para vídeo ${videoId}:`, error);
      return null;
    }
  }

  useEffect(() => {
    loadTvShows().then(() => {
      calculateStats()
    })
  }, [])

  // Listener para tecla ESC
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllPlayers()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [])

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') {
      console.log('🔍 getAuthToken: Executando no servidor, retornando null')
      return null;
    }
    
    console.log('🔍 Buscando token de autenticação...')
    
    let token = localStorage.getItem('auth_token') || 
                localStorage.getItem('token') ||
                localStorage.getItem('authToken') ||
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('auth_token');
    
    if (token) {
      console.log('✅ Token encontrado no storage:', token.substring(0, 20) + '...')
      return token;
    }
    
    // Buscar em cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' || name === 'token' || name === 'authToken') {
        token = decodeURIComponent(value);
        console.log('✅ Token encontrado nos cookies:', token.substring(0, 20) + '...')
        return token;
      }
    }
    
    // Tentar buscar de forma mais ampla
    const allStorageKeys = Object.keys(localStorage);
    console.log('🔍 Chaves disponíveis no localStorage:', allStorageKeys);
    
    for (const key of allStorageKeys) {
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
        const value = localStorage.getItem(key);
        if (value && value.length > 10) {
          console.log(`✅ Token encontrado na chave '${key}':`, value.substring(0, 20) + '...')
          return value;
        }
      }
    }
    
    console.error('❌ Nenhum token de autenticação encontrado!')
    console.log('💡 Verificando se existe sessão ativa...')
    
    // Em último caso, verificar se há dados de usuário logado
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      console.log('👤 Dados de usuário encontrados:', userData.substring(0, 50) + '...')
    }
    
    return null;
  }

  // Função para fazer fetch com timeout personalizado
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = 30000): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  };

  // Função para fazer fetch com retry e backoff exponencial
  const fetchWithRetry = async (url: string, options: RequestInit = {}, maxRetries: number = 3): Promise<Response> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} para: ${url}`);
        
        const response = await fetchWithTimeout(url, options, 30000);
        
        // Se a resposta for bem-sucedida, retornar
        if (response.ok) {
          console.log(`✅ Sucesso na tentativa ${attempt} para: ${url}`);
          return response;
        }
        
        // Se for erro 504, 502, 503 (erros de gateway/servidor), tentar novamente
        if ([502, 503, 504].includes(response.status)) {
          console.warn(`⚠️ Erro ${response.status} na tentativa ${attempt}/${maxRetries}: ${response.statusText}`);
          
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // Para outros erros HTTP, retornar a resposta (será tratada pelo código chamador)
        return response;
        
      } catch (error) {
        console.warn(`⚠️ Erro na tentativa ${attempt}/${maxRetries}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ Todas as ${maxRetries} tentativas falharam para: ${url}`);
    throw lastError!;
  };

  const loadTvShows = async (page = 1, search = '') => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search })
      })

      const token = getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const url = `/api/tv-shows?${params}`;
      console.log('🔗 Carregando TV Shows de:', url);

      const response = await fetchWithRetry(url, { headers }, 3);

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const tvShowsData = data.data?.tvShows || []
          
          // Log para debug
          console.log('✅ TV Shows carregados:', tvShowsData.length)
          console.log('📊 Contagem de vídeos por show:', tvShowsData.map((show: TVShowListItem) => ({
            name: show.name,
            video_count: show.video_count
          })))
          
          setTvShows(tvShowsData)
          setTotalPages(data.data?.totalPages || 1)
          setCurrentPage(data.data?.page || 1)
          
          // Recalcular estatísticas após carregar os dados
          if (page === 1) {
            setTimeout(() => calculateStats(), 100)
          }
        }
      } else {
        console.error('❌ Erro na resposta da API:', response.status, response.statusText);
        
        // Se for erro de autenticação, tentar dados simulados
        if (response.status === 401) {
          console.warn('⚠️ Erro de autenticação - usando dados simulados');
          const mockData = {
            success: true,
            data: {
              tvShows: [],
              totalPages: 1,
              page: 1
            }
          };
          
          setTvShows(mockData.data.tvShows);
          setTotalPages(mockData.data.totalPages);
          setCurrentPage(mockData.data.page);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar TV Shows:', error);
      
      // Em caso de erro, usar dados simulados
      console.warn('⚠️ Usando dados simulados devido ao erro');
      setTvShows([]);
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = async () => {
    try {
      const token = getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const url = '/api/tv-shows?page=1&limit=10000';
      console.log('📊 Calculando estatísticas de:', url);

      // Buscar TODAS as coleções para calcular estatísticas corretas
      const response = await fetchWithRetry(url, { headers }, 3);
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.tvShows) {
          const allCollections = data.data.tvShows
          
          const totalCollections = allCollections.length
          
          // Somar TODOS os vídeos de TODAS as coleções ativas
          let totalVideos = 0
          let totalMinutes = 0
          let ratingsSum = 0
          let ratingsCount = 0
          let collectionsWithVideos = 0
          
          console.log('=== CALCULANDO TOTAL DE VÍDEOS ===')
          console.log('Total de coleções encontradas:', allCollections.length)
          
          allCollections.forEach((show: TVShowListItem, index: number) => {
            // Contar vídeos - somar TODOS os vídeos de cada coleção
            let videoCount = show.video_count || 0
            
            // VALIDAÇÃO: Detectar valores absurdos e resetar para 0
            if (videoCount > 10000) {
              console.error(`🚨 VALOR ABSURDO DETECTADO: ${show.name} tem ${videoCount} vídeos - RESETANDO PARA 0`)
              videoCount = 0
            }
            
            if (videoCount > 0) {
              totalVideos += videoCount
              collectionsWithVideos++
              console.log(`${index + 1}. ${show.name}: ${videoCount} vídeos (total acumulado: ${totalVideos})`)
            } else {
              console.log(`${index + 1}. ${show.name}: 0 vídeos`)
            }
            
            // Calcular duração total
            if (show.total_load) {
              // Tentar diferentes formatos de duração
              let match = show.total_load.match(/(\d+)h\s*(\d+)m?/)
              if (!match) {
                match = show.total_load.match(/(\d+)h/)
                if (match) {
                  totalMinutes += parseInt(match[1]) * 60
                }
              } else {
                totalMinutes += parseInt(match[1]) * 60 + (parseInt(match[2]) || 0)
              }
              
              // Tentar formato apenas minutos
              if (!match) {
                const minutesMatch = show.total_load.match(/(\d+)m/)
                if (minutesMatch) {
                  totalMinutes += parseInt(minutesMatch[1])
                }
              }
            }
            
            // Calcular média de avaliação
            if (show.vote_average && show.vote_average > 0) {
              ratingsSum += show.vote_average
              ratingsCount++
            }
          })
          
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          const totalDuration = totalMinutes > 0 ? `${hours}h ${minutes}m` : '0h 0m'
          
          const avgRating = ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0
          
          console.log('=== RESULTADO FINAL ===')
          console.log('✅ Total de coleções:', totalCollections)
          console.log('✅ Coleções com vídeos:', collectionsWithVideos)
          console.log('✅ TOTAL DE VÍDEOS:', totalVideos)
          console.log('✅ Duração total:', totalDuration)
          console.log('✅ Avaliação média:', avgRating)
          console.log('========================')
          
          setStats({
            totalCollections,
            totalVideos,
            totalDuration,
            avgRating
          })
        }
      } else {
        console.error('❌ Erro na resposta da API de estatísticas:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error)
      
      // Em caso de erro, calcular com base nos dados já carregados
      const fallbackTotalVideos = tvShows.reduce((sum, show) => {
        const videoCount = show.video_count || 0
        return sum + videoCount
      }, 0)
      
      console.log('⚠️ Fallback - Total de vídeos calculado:', fallbackTotalVideos)
      
      setStats({
        totalCollections: tvShows.length,
        totalVideos: fallbackTotalVideos,
        totalDuration: '0h 0m',
        avgRating: 0
      })
    }
  }

  const loadTvShowDetails = async (id: number) => {
    try {
      setIsLoading(true)
      
      // Limpar estados do player ao carregar nova coleção
      closeAllPlayers()
      
      const token = getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const url = `/api/tv-shows/${id}`;
      console.log('🔍 Carregando detalhes da coleção:', url);

      const response = await fetchWithRetry(url, { headers }, 3);
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const tvShowData = data.data
          console.log('✅ Detalhes da coleção carregados:', tvShowData.name);
          setSelectedTvShow(tvShowData)
          // Os módulos já vêm incluídos na resposta
          if (tvShowData.modules) {
            setModules(tvShowData.modules)
            console.log('📁 Módulos carregados:', Object.keys(tvShowData.modules).length);
          }
        }
      } else {
        console.error('❌ Erro na resposta da API de detalhes:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do TV Show:', error)
      setSelectedTvShow(null)
      setModules({})
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
    loadTvShows(1, term)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadTvShows(page, searchTerm)
  }

  const applyFilters = () => {
    let filtered = [...tvShows]

    // Filtro por produtor
    if (filters.producer) {
      filtered = filtered.filter(show => 
        show.producer?.toLowerCase().includes(filters.producer.toLowerCase())
      )
    }

    // Filtro por duração
    if (filters.minDuration || filters.maxDuration) {
      filtered = filtered.filter(show => {
        if (!show.total_load) return false
        const match = show.total_load.match(/(\d+)h(\d+)/)
        if (!match) return false
        const totalMinutes = parseInt(match[1]) * 60 + parseInt(match[2])
        
        if (filters.minDuration && totalMinutes < parseInt(filters.minDuration) * 60) return false
        if (filters.maxDuration && totalMinutes > parseInt(filters.maxDuration) * 60) return false
        return true
      })
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime()
        case 'duration':
          const getDuration = (show: TVShowListItem) => {
            if (!show.total_load) return 0
            const match = show.total_load.match(/(\d+)h(\d+)/)
            return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0
          }
          return getDuration(b) - getDuration(a)
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0)
        default: // name
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }

  const filteredTvShows = applyFilters()

  // Função para transformar TVShowVideo em formato do UniversalVideoPlayer
  const transformVideoForPlayer = (video: TVShowVideo, index: number) => {
    console.log(`🔄 Transformando vídeo ${video.id}:`, {
      title: video.title,
      video_url: video.video_url,
      hasUrl: !!video.video_url
    })
    
    return {
      id: video.id.toString(),
      title: video.title,
      url: video.video_url || '',
      type: detectVideoType(video.video_url || '') as 'mp4' | 'youtube' | 'vimeo' | 'direct',
      thumbnail: video.thumbnail_url,
      duration: video.duration,
      description: video.description,
      episode_number: video.episode_number || index + 1
    }
  }

  // Função para detectar tipo de vídeo - MELHORADA
  const detectVideoType = (url: string): 'mp4' | 'youtube' | 'vimeo' | 'direct' => {
    if (!url) {
      console.log('🔍 URL vazia, usando tipo "direct"')
      return 'direct'
    }
    
    console.log('🔍 Detectando tipo de vídeo para URL:', url)
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      console.log('✅ Tipo detectado: youtube')
      return 'youtube'
    }
    
    if (url.includes('vimeo.com')) {
      console.log('✅ Tipo detectado: vimeo')
      return 'vimeo'
    }
    
    if (url.endsWith('.mp4') || url.includes('.mp4') || url.includes('cloudfront.net')) {
      console.log('✅ Tipo detectado: mp4')
      return 'mp4'
    }
    
    console.log('✅ Tipo detectado: direct (fallback)')
    return 'direct'
  }

  // Função para verificar autenticação
  const checkAuthentication = (): boolean => {
    const token = getAuthToken();
    if (!token) {
      alert('❌ Erro de Autenticação\n\nVocê precisa estar logado para assistir aos vídeos.\n\nPor favor, faça login novamente e tente novamente.');
      return false;
    }
    return true;
  }

  // Função para abrir o player de sessão - MELHORADA
  const handleWatchSession = async (moduleKey: string, moduleVideos: TVShowVideo[]) => {
    console.log('🎬 Tentando abrir player de sessão:', {
      moduleKey,
      videosCount: moduleVideos.length,
      selectedTvShow: selectedTvShow?.id,
      selectedTvShowName: selectedTvShow?.name
    })
    
    // Verificar autenticação primeiro
    if (!checkAuthentication()) {
      return;
    }
    
    if (!selectedTvShow) {
      console.error('❌ Erro: selectedTvShow não está definido')
      alert('Erro: Coleção não selecionada. Tente recarregar a página.')
      return
    }
    
    if (!moduleVideos || moduleVideos.length === 0) {
      console.error('❌ Erro: Nenhum vídeo encontrado para esta sessão')
      alert('Erro: Nenhum vídeo disponível nesta sessão.')
      return
    }
    
    // Processar URLs dos vídeos - agora com suporte para URLs já construídas pelo backend
    const videosWithUrls = await Promise.all(moduleVideos.map(async video => {
      console.log(`🔍 Processando vídeo ${video.id}: ${video.title}`)
      
      // Primeiro: verificar se já tem video_url válida (vinda do backend)
      if (video.video_url && video.video_url.trim()) {
        console.log(`✅ Vídeo ${video.id} já tem URL do backend: ${video.video_url}`)
        return video
      }
      
      // Segundo: tentar usar dados diretos do arquivo se disponíveis
      if (video.file_sha256hex && video.file_extension) {
        const cloudFrontUrl = buildVideoUrl(video.file_sha256hex, video.file_extension)
        if (cloudFrontUrl) {
          console.log(`🔗 URL construída com dados diretos para vídeo ${video.id}: ${cloudFrontUrl}`)
          return { ...video, video_url: cloudFrontUrl }
        }
      }
      
      // Terceiro: fallback - buscar dados do arquivo usando a API
      if (video.id) {
        console.log(`🔍 Fallback: Buscando dados do arquivo via API para vídeo ID: ${video.id}`)
        const fileData = await fetchVideoFileData(video.id.toString())
        
        if (fileData) {
          const cloudFrontUrl = buildVideoUrl(fileData.sha256hex, fileData.extension)
          if (cloudFrontUrl) {
            console.log(`🔗 URL construída via API para vídeo ${video.id}: ${cloudFrontUrl}`)
            return { ...video, video_url: cloudFrontUrl }
          }
        }
      }
      
      console.warn(`⚠️ Não foi possível obter URL para vídeo ${video.id}: ${video.title}`)
      return video
    }))
    
    const videosWithValidUrls = videosWithUrls.filter(v => v.video_url && v.video_url.trim())
    
    console.log('📊 Vídeos processados:', {
      total: videosWithUrls.length,
      withUrls: videosWithValidUrls.length,
      withoutUrls: videosWithUrls.length - videosWithValidUrls.length
    })
    
    if (videosWithValidUrls.length === 0) {
      console.error('❌ Erro: Nenhum vídeo com URL válida encontrado')
      alert('Erro: Nenhum vídeo disponível para reprodução. Verifique se os arquivos foram carregados corretamente.')
      return
    }
    
    console.log('✅ Abrindo player universal para sessão')
    
    // Transformar vídeos para formato do UniversalVideoPlayer
    const transformedVideos = videosWithValidUrls.map((video, index) => transformVideoForPlayer(video, index))
    
    console.log('🎯 Vídeos transformados:', transformedVideos.map(v => ({
      id: v.id,
      title: v.title,
      url: v.url,
      type: v.type,
      hasUrl: !!v.url
    })))
    
    // Extrair número da sessão
    const sessionNumber = parseInt(moduleKey.split('_')[1]) || 1
    
    console.log('🎬 Configurando player para sessão:', {
      collectionName: selectedTvShow.name,
      sessionNumber,
      videosCount: transformedVideos.length,
      initialIndex: 0
    })
    
    // Configurar player
    setPlayerVideos(transformedVideos)
    setPlayerCollectionName(selectedTvShow.name)
    setPlayerSessionNumber(sessionNumber)
    setPlayerInitialIndex(0)
    setShowUniversalPlayer(true)
    
    console.log('🎬 Player configurado - showUniversalPlayer definido como true')
  }

  // Função para abrir player de vídeo individual - MELHORADA
  const handleWatchVideo = async (video: any, videoTitle: string) => {
    console.log('🎥 Tentando abrir player individual:', {
      video,
      videoTitle,
      videoId: video.id,
      titleValid: !!videoTitle,
      hasVideoUrl: !!video.video_url,
      hasFileData: !!(video.file_sha256hex && video.file_extension)
    })
    
    // Verificar autenticação primeiro
    if (!checkAuthentication()) {
      return;
    }
    
    if (!video || !video.id) {
      console.error('❌ Erro: Dados do vídeo inválidos')
      alert('Erro: Dados do vídeo inválidos.')
      return
    }
    
    let videoUrl = video.video_url && video.video_url.trim() ? video.video_url : null
    
    // Primeiro: verificar se já tem video_url válida (vinda do backend)
    if (videoUrl) {
      console.log('✅ Vídeo já tem URL do backend:', videoUrl)
    }
    // Segundo: tentar usar dados diretos do arquivo se disponíveis
    else if (video.file_sha256hex && video.file_extension) {
      videoUrl = buildVideoUrl(video.file_sha256hex, video.file_extension)
      if (videoUrl) {
        console.log('🔗 URL construída com dados diretos:', videoUrl)
      }
    }
    // Terceiro: fallback - buscar dados do arquivo usando a API
    else if (video.id) {
      console.log(`🔍 Fallback: Buscando dados do arquivo via API para vídeo ID: ${video.id}`)
      const fileData = await fetchVideoFileData(video.id.toString())
      
      if (fileData) {
        videoUrl = buildVideoUrl(fileData.sha256hex, fileData.extension)
        if (videoUrl) {
          console.log('🔗 URL construída via API:', videoUrl)
        }
      }
    }
    
    if (!videoUrl || !videoUrl.trim()) {
      console.error('❌ Erro: URL do vídeo não encontrada e não foi possível construir')
      alert('Erro: URL do vídeo não disponível. Verifique se o arquivo foi carregado corretamente.')
      return
    }
    
    if (!videoTitle || !videoTitle.trim()) {
      console.warn('⚠️ Aviso: Título do vídeo não fornecido, usando título padrão')
      videoTitle = video.title || 'Vídeo Individual'
    }
    
    console.log('✅ Abrindo player individual com URL:', videoUrl)
    
    // Criar vídeo único para o player
    const singleVideo = {
      ...video,
      video_url: videoUrl
    }
    
    const transformedVideo = transformVideoForPlayer(singleVideo, 0)
    
    console.log('🎯 Vídeo transformado:', {
      id: transformedVideo.id,
      title: transformedVideo.title,
      url: transformedVideo.url,
      type: transformedVideo.type,
      hasUrl: !!transformedVideo.url
    })
    
    console.log('🎬 Configurando player para vídeo individual:', {
      collectionName: videoTitle,
      sessionNumber: undefined,
      videosCount: 1,
      initialIndex: 0
    })
    
    // Configurar player para vídeo individual
    setPlayerVideos([transformedVideo])
    setPlayerCollectionName(videoTitle)
    setPlayerSessionNumber(undefined)
    setPlayerInitialIndex(0)
    setShowUniversalPlayer(true)
    
    console.log('🎬 Player configurado para vídeo individual - showUniversalPlayer definido como true')
  }

  // Função para fechar o player - SIMPLIFICADA
  const closeAllPlayers = () => {
    console.log('🔒 Fechando player universal')
    console.log('🔒 Estado atual do player:', {
      showUniversalPlayer,
      playerVideos: playerVideos.length,
      playerCollectionName
    })
    
    setShowUniversalPlayer(false)
    setPlayerVideos([])
    setPlayerCollectionName('')
    setPlayerSessionNumber(undefined)
    setPlayerInitialIndex(0)
    
    console.log('🔒 Player fechado com sucesso')
  }

  const toggleDescriptionExpansion = (tvShowId: number) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tvShowId)) {
        newSet.delete(tvShowId)
      } else {
        newSet.add(tvShowId)
      }
      return newSet
    })
  }

  if (currentView === 'videos' && selectedTvShow) {
    return (
      <div className="w-full">
        <button 
          onClick={() => {
            // Limpar estados do player ao voltar para a lista
            closeAllPlayers()
            setCurrentView('list')
          }}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          ← Voltar para Lista
        </button>
        
        <div className="overflow-hidden">
          {/* Header com informações da coleção */}
          <div className="relative">
            {/* Container da imagem de fundo */}
            <div className="h-auto py-8 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
              {/* Imagem de fundo */}
              {(selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url) && (
                <img
                  src={selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url || ''}
                  alt={selectedTvShow.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-15"
                />
              )}
              
              {/* Overlay escuro */}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              
              {/* Conteúdo sobreposto */}
              <div className="relative z-10 p-6 text-white w-full">
                <div className="flex items-start gap-6">
                  {/* Poster menor */}
                  <div className="flex-shrink-0">
                    <img
                      src={selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url || '/placeholder-collection.jpg'}
                      alt={selectedTvShow.name}
                      className="w-24 h-36 object-cover rounded-lg shadow-2xl border-2 border-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-collection.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Informações da Coleção - Layout horizontal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-2xl font-bold text-yellow-300 drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>{selectedTvShow.name}</h1>
                      <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium ml-4">
                        Coleção Educacional
                      </span>
                    </div>
                    
                    {/* Informações principais em linha horizontal */}
                    <div className="flex flex-wrap items-center gap-6 text-sm mb-3">
                      {selectedTvShow.producer && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">Produtor:</span>
                          <span className="font-medium">{selectedTvShow.producer}</span>
                        </div>
                      )}
                      
                      {/* Autor da coleção */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">Autor:</span>
                        <span className="font-medium">{selectedTvShow.producer || 'Sistema Portal'}</span>
                      </div>
                      
                      {selectedTvShow.first_air_date && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">Lançamento:</span>
                          <span className="font-medium">{formatDate(selectedTvShow.first_air_date)}</span>
                        </div>
                      )}
                      
                      {selectedTvShow.total_load && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-300" />
                          <span className="font-medium">{selectedTvShow.total_load}</span>
                        </div>
                      )}
                      
                      {selectedTvShow.vote_average && selectedTvShow.vote_average > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="font-medium">{selectedTvShow.vote_average}/10</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Estatísticas compactas */}
                    <div className="flex items-center gap-4 text-xs text-gray-300 mb-4">
                      {Object.keys(modules).length > 0 && (
                        <div className="flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          <span>{Object.keys(modules).length} sessão{Object.keys(modules).length > 1 ? 'ões' : ''}</span>
                        </div>
                      )}
                      
                      {(() => {
                        const totalVideos = Object.values(modules).reduce((sum, videos) => sum + videos.length, 0);
                        if (totalVideos > 0) {
                          return (
                            <div className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              <span>{totalVideos} vídeo{totalVideos > 1 ? 's' : ''}</span>
                            </div>
                          );
                        } else if (selectedTvShow.video_count && selectedTvShow.video_count > 0) {
                          return (
                            <div className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              <span>{selectedTvShow.video_count} vídeo{selectedTvShow.video_count > 1 ? 's' : ''}</span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                      
                      {selectedTvShow.popularity && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Pop: {selectedTvShow.popularity.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {selectedTvShow.manual_support_path && (
                        <div className="flex items-center gap-1 text-green-300">
                          <FileText className="w-3 h-3" />
                          <span>E-Book</span>
                        </div>
                      )}
                    </div>

                    {/* Sinopse da Coleção integrada ao header */}
                    {selectedTvShow.overview && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <h3 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Sinopse da Coleção
                        </h3>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          {selectedTvShow.overview}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          
          {/* Conteúdo dos vídeos */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 text-lg">Carregando vídeos...</span>
              </div>
            ) : Object.keys(modules).length === 0 ? (
              <div className="text-center py-16">
                <Play className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-600 mb-3">Coleção Carregada com Sucesso</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-semibold text-blue-800 mb-2">
                        {selectedTvShow.name}
                      </h4>
                      <p className="text-blue-700 mb-3">
                        Esta coleção foi carregada com sucesso! Os vídeos estão sendo configurados e em breve estarão disponíveis.
                      </p>
                      <div className="space-y-2 text-sm text-blue-600">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>Produtor: {selectedTvShow.producer || 'Sistema Portal'}</span>
                        </div>
                        {selectedTvShow.total_load && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Duração: {selectedTvShow.total_load}</span>
                          </div>
                        )}
                        {selectedTvShow.vote_average && selectedTvShow.vote_average > 0 && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            <span>Avaliação: {selectedTvShow.vote_average}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-base mt-6">
                  Em breve você poderá assistir aos vídeos organizados por sessões
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Conteúdo da Coleção</h2>
                  <p className="text-sm text-gray-600">Explore todos os vídeos organizados por sessões</p>
                </div>
                
                {Object.entries(modules)
                  .sort(([a], [b]) => {
                    // Ordenar por número da sessão
                    const numA = parseInt(a.split('_')[1]) || 0;
                    const numB = parseInt(b.split('_')[1]) || 0;
                    return numA - numB;
                  })
                  .map(([moduleKey, moduleVideos]) => {
                    const sessionNumber = parseInt(moduleKey.split('_')[1]) || 1;
                    
                    return (
                      <div key={moduleKey} className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
                        {/* Header da sessão */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 mb-1">
                                Sessão {sessionNumber}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {moduleVideos.length} vídeo{moduleVideos.length > 1 ? 's' : ''} disponível{moduleVideos.length > 1 ? 'eis' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('🎬 Clique em Assistir Sessão:', {
                                    moduleKey,
                                    videosCount: moduleVideos.length,
                                    videos: moduleVideos.map(v => ({ title: v.title, url: v.video_url }))
                                  });
                                  handleWatchSession(moduleKey, moduleVideos);
                                }}
                                className="flex items-center gap-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 px-4 py-2 rounded-lg border border-blue-300 shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                <Play className="w-4 h-4" />
                                <span className="font-semibold text-sm">Assistir Sessão</span>
                                <span className="text-blue-100 text-xs">({moduleVideos.length})</span>
                              </button>
                              
                              {selectedTvShow.manual_support_path ? (
                                <button 
                                  onClick={() => window.open(selectedTvShow.manual_support_path, '_blank')}
                                  className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg border border-green-200"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="font-medium text-sm">E-Book</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-400 px-4 py-2">
                                  <FileText className="w-5 h-5" />
                                  <span className="font-medium text-sm">E-Book em breve</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Lista de vídeos da sessão */}
                        <div className="p-4">
                          <div className="space-y-3">
                            {moduleVideos.map((video, index) => (
                              <div key={video.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                                <div className="flex items-start gap-4">
                                  {/* Thumbnail e botão play */}
                                  <div className="relative flex-shrink-0">
                                    <div className="w-24 h-16 bg-gray-300 rounded-lg overflow-hidden relative group cursor-pointer">
                                      {video.thumbnail_url ? (
                                        <img
                                          src={video.thumbnail_url}
                                          alt={video.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url || '/placeholder-collection.jpg';
                                          }}
                                        />
                                      ) : (
                                        <img
                                          src={selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url || '/placeholder-collection.jpg'}
                                          alt={video.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-collection.jpg';
                                          }}
                                        />
                                      )}
                                      
                                      {/* Overlay com play */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                        <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      </div>
                                      
                                      {/* Duração */}
                                      {video.duration && (
                                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                          {video.duration}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Número do episódio */}
                                    <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                      {video.episode_number || index + 1}
                                    </div>
                                  </div>
                                  
                                  {/* Informações do vídeo */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="text-base font-semibold text-gray-800 line-clamp-2">
                                        {video.title}
                                      </h4>
                                      <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                                        Ep. {video.episode_number || index + 1}
                                      </span>
                                    </div>
                                    
                                    {/* Informações detalhadas */}
                                    <div className="flex flex-wrap items-center gap-4 mb-3 text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Produtor:</span>
                                        <span className="font-medium text-gray-700">
                                          {selectedTvShow.producer || 'Não informado'}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Autor:</span>
                                        <span className="font-medium text-gray-700">
                                          {selectedTvShow.producer || 'Sistema Portal'}
                                        </span>
                                      </div>
                                      
                                      {video.duration && (
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-3 h-3 text-gray-500" />
                                          <span className="font-medium text-gray-700">{video.duration}</span>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-500">Sessão:</span>
                                        <span className="font-medium text-gray-700">{sessionNumber}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Sinopse completa do vídeo */}
                                    {video.description && (
                                      <div className="mb-3">
                                        <h5 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                          <BookOpen className="w-3 h-3" />
                                          Sinopse:
                                        </h5>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                          {video.description}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Botões de ação */}
                                    <div className="flex items-center gap-2">
                                      <button 
                                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg transform hover:scale-105"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleWatchVideo(video, video.title);
                                        }}
                                      >
                                        <Play className="w-3 h-3" />
                                        Assistir Agora
                                      </button>
                                      
                                      <button 
                                        className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 text-xs font-medium rounded-lg hover:from-green-100 hover:to-green-200 border border-green-200 hover:border-green-300 transition-all duration-200 flex items-center gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // TODO: Implementar funcionalidade de adicionar à lista
                                          console.log('📝 Adicionar à lista:', video.title);
                                        }}
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Adicionar à Lista
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* UniversalVideoPlayer Modal - Apenas na tela de vídeos */}
        {showUniversalPlayer && playerVideos.length > 0 && (() => {
          console.log('🎬 RENDERIZANDO UniversalVideoPlayer:', {
            showUniversalPlayer,
            playerVideosCount: playerVideos.length,
            playerCollectionName,
            playerSessionNumber,
            playerInitialIndex
          })
          
          return (
            <UniversalVideoPlayer
              videos={playerVideos}
              initialVideoIndex={playerInitialIndex}
              collectionName={playerCollectionName}
              sessionNumber={playerSessionNumber}
              onClose={closeAllPlayers}
              autoplay={true}
            />
          )
        })()}
      </div>
    )
  }

  return (
    <div className="space-y-6">
    {/* Header da Página */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Portal de Coleções Educativas
        </h1>
        <p className="text-gray-600">
          Explore e gerencie todo o conteúdo educacional disponível em nossa plataforma
        </p>
      </div>
    </div>

        {/* Cards de Estatísticas - Layout Melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Card Total de Coleções */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-blue-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-blue-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-purple-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.totalCollections}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-blue-100 font-semibold tracking-wide">COLEÇÕES</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Total de Coleções</h3>
                <p className="text-blue-100 text-sm">Organizadas no sistema</p>
              </div>
            </div>
          </div>

          {/* Card Total de Vídeos */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-emerald-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-emerald-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-teal-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-cyan-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.totalVideos}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-emerald-100 font-semibold tracking-wide">VÍDEOS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Total de Vídeos</h3>
                <p className="text-emerald-100 text-sm">Conteúdo disponível</p>
              </div>
            </div>
          </div>

          {/* Card Duração Total */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-purple-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-purple-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-violet-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-fuchsia-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.totalDuration}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-purple-100 font-semibold tracking-wide">DURAÇÃO</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Duração Total</h3>
                <p className="text-purple-100 text-sm">Tempo de conteúdo</p>
              </div>
            </div>
          </div>

          {/* Card Avaliação Média */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-amber-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-amber-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-orange-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-red-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.avgRating}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-amber-100 font-semibold tracking-wide">ESTRELAS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Avaliação Média</h3>
                <p className="text-amber-100 text-sm">Qualidade do conteúdo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Busca e Filtros - Design Melhorado */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Busca com Design Melhorado */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Buscar coleções por nome, produtor ou descrição..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Botão de Filtros com Design Melhorado */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-xl flex items-center gap-3 font-medium transition-all duration-200 ${
                showFilters 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtros Avançados</span>
              {showFilters && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          </div>

          {/* Painel de Filtros com Animação */}
          {showFilters && (
            <div className="border-t-2 border-gray-100 pt-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Produtor
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sabercon, Portal..."
                    value={filters.producer}
                    onChange={(e) => setFilters({...filters, producer: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Duração Mín. (horas)
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minDuration}
                    onChange={(e) => setFilters({...filters, minDuration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Duração Máx. (horas)
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={filters.maxDuration}
                    onChange={(e) => setFilters({...filters, maxDuration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      Ordenar por
                    </span>
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all duration-200 bg-white"
                  >
                    <option value="name">📝 Nome (A-Z)</option>
                    <option value="date">📅 Data de Criação</option>
                    <option value="duration">⏱️ Duração</option>
                    <option value="popularity">⭐ Popularidade</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Grid de Coleções - Layout Melhorado */}
        {!isLoading && (
          <div>
            {/* Header da Seção de Coleções */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Suas Coleções</h2>
                <p className="text-gray-600 mt-1">
                  {filteredTvShows.length} de {stats.totalCollections} coleções encontradas
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span>Ativo</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="w-4 h-4" />
                  <span>{stats.totalVideos} vídeos</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTvShows.map((tvShow) => (
              <div
                key={tvShow.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
                onClick={() => {
                  loadTvShowDetails(tvShow.id)
                  setCurrentView('videos')
                }}
              >
                {/* Imagem da coleção - responsiva mas completa */}
                <div className="relative w-full aspect-[496/702] bg-gray-200 overflow-hidden">
                  {tvShow.poster_image_url || tvShow.backdrop_image_url ? (
                    <img
                      src={tvShow.poster_image_url || tvShow.backdrop_image_url || ''}
                      alt={tvShow.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-collection.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Folder className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay com informações */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                    <div className="w-full p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 text-sm">
                        <Play className="w-4 h-4" />
                        <span>
                          {tvShow.video_count && tvShow.video_count > 0 
                            ? `${tvShow.video_count} vídeo${tvShow.video_count > 1 ? 's' : ''}`
                            : 'Coleção disponível'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card - Layout Melhorado */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {tvShow.name}
                  </h3>
                  
                  {tvShow.producer && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        {tvShow.producer}
                      </span>
                    </div>
                  )}

                  {/* Estatísticas do card - Design Melhorado */}
                  <div className="space-y-3 mb-4">
                    {/* Vídeos - Destaque */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-700">
                          {tvShow.video_count && tvShow.video_count > 0 
                            ? `${tvShow.video_count} vídeo${tvShow.video_count > 1 ? 's' : ''}`
                            : 'Vídeos disponíveis'
                          }
                        </p>
                        <p className="text-xs text-green-600">Conteúdo educacional</p>
                      </div>
                    </div>
                    
                    {/* Duração e Avaliação */}
                    <div className="flex items-center gap-3">
                      {tvShow.total_load && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{tvShow.total_load}</span>
                        </div>
                      )}
                      
                      {tvShow.vote_average && tvShow.vote_average > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 px-3 py-2 rounded-lg">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="font-medium">{tvShow.vote_average}/10</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {tvShow.overview && (
                    <div className="mb-4 sm:mb-5 lg:mb-6">
                      {/* Container da descrição com design responsivo */}
                      <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 lg:p-5 border border-gray-200 transition-all duration-500 ${
                        expandedDescriptions.has(tvShow.id) 
                          ? 'shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50' 
                          : 'hover:shadow-md hover:border-gray-300'
                      }`}>
                        
                                              {/* Ícone de citação */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                        </svg>
                      </div>

                      {/* Texto da descrição */}
                      <div className={`text-sm sm:text-base text-gray-700 leading-relaxed pr-6 sm:pr-8 transition-all duration-500 ${
                        expandedDescriptions.has(tvShow.id) ? 'max-h-none' : 'line-clamp-3'
                      }`}>
                        <p className={`${expandedDescriptions.has(tvShow.id) ? 'mb-4' : 'mb-0'}`}>
                          {tvShow.overview}
                        </p>
                        
                        {/* Informações adicionais quando expandido */}
                        {expandedDescriptions.has(tvShow.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {tvShow.producer && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {tvShow.producer}
                                </span>
                              )}
                              
                              {tvShow.first_air_date && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {formatYear(tvShow.first_air_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Botão Ver mais/Ver menos - design melhorado */}
                    {tvShow.overview.length > 150 && (
                      <div className="flex justify-center mt-3 sm:mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleDescriptionExpansion(tvShow.id)
                          }}
                          className="group flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all duration-300 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                        >
                          <span className="tracking-wide">
                            {expandedDescriptions.has(tvShow.id) ? 'Ver menos' : 'Ver mais detalhes'}
                          </span>
                          <div className={`p-1 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-all duration-300 ${
                            expandedDescriptions.has(tvShow.id) ? 'rotate-180' : ''
                          }`}>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer do Card */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {tvShow.first_air_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatYear(tvShow.first_air_date)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-blue-600 font-medium group-hover:text-blue-700">
                    <span>Ver coleção</span>
                    <div className="w-1 h-1 bg-blue-400 rounded-full group-hover:animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>
      )}

      {/* Paginação */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

        {/* Estado vazio */}
        {!isLoading && filteredTvShows.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma coleção encontrada</h3>
            <p className="text-gray-500">
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Tente ajustar os filtros de busca'
                : 'Nenhuma coleção disponível no momento'
              }
            </p>
          </div>
        )}
      </div>
  )
}