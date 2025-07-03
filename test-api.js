// Teste simples da API
const testAPI = async () => {
  try {
    console.log('🔍 Testando API /api/tv-shows...')
    
    const response = await fetch('http://localhost:3001/api/tv-shows?page=1&limit=5')
    
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      console.error('❌ Erro na resposta:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Erro detalhado:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('✅ Dados recebidos:', {
      success: data.success,
      message: data.message,
      dataKeys: data.data ? Object.keys(data.data) : null,
      tvShowsCount: data.data?.tvShows?.length || 0
    })
    
    if (data.data?.tvShows?.length > 0) {
      console.log('📺 Primeira coleção:', {
        id: data.data.tvShows[0].id,
        name: data.data.tvShows[0].name,
        video_count: data.data.tvShows[0].video_count
      })
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message)
  }
}

testAPI() 