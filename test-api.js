// Teste da API com autenticação
const BASE_URL = 'https://portal.sabercon.com.br'

// Configurações de login (ajuste conforme necessário)
const LOGIN_CREDENTIALS = {
  email: 'admin@sabercon.edu.br', // ⚠️ ALTERE AQUI
  password: 'password123',          // ⚠️ ALTERE AQUI
  rememberMe: false
}

// Função para fazer login e obter token
const login = async () => {
  try {
    console.log('🔐 Fazendo login...')
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(LOGIN_CREDENTIALS)
    })
    
    console.log('Login Status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.log('❌ Erro no login:', errorData)
      return null
    }
    
    const loginData = await response.json()
    console.log('✅ Login realizado com sucesso!')
    console.log('Usuário:', loginData.data?.user?.name || 'N/A')
    console.log('Role:', loginData.data?.user?.role || 'N/A')
    
    return {
      accessToken: loginData.data?.accessToken,
      refreshToken: loginData.data?.refreshToken,
      user: loginData.data?.user
    }
    
  } catch (error) {
    console.log('❌ Erro no login:', error.message)
    return null
  }
}

// Função para testar API com autenticação
const testAuthenticatedAPI = async (authData) => {
  try {
    console.log('\n🔍 Testando API /api/tv-shows com autenticação...')
    
    // Método 1: Bearer Token no header Authorization
    const response = await fetch(`${BASE_URL}/api/tv-shows?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    
    if (!response.ok) {
      console.log('❌ Erro na resposta:', response.status, response.statusText)
      const errorText = await response.text()
      console.log('Erro detalhado:', errorText)
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
    console.log('❌ Erro na requisição autenticada:', error.message)
  }
}

// Função para testar método alternativo de autenticação
const testAlternativeAuth = async (authData) => {
  try {
    console.log('\n🔍 Testando API com header X-Auth-Token...')
    
    // Método 2: X-Auth-Token header
    const response = await fetch(`${BASE_URL}/api/tv-shows?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': authData.accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('Status (X-Auth-Token):', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Autenticação alternativa funcionou!')
      console.log('TV Shows encontrados:', data.data?.tvShows?.length || 0)
    } else {
      console.log('❌ Método alternativo falhou:', response.status)
    }
    
  } catch (error) {
    console.log('❌ Erro no método alternativo:', error.message)
  }
}

// Função principal
const runTests = async () => {
  console.log('🚀 Iniciando testes da API com autenticação...')
  console.log('⚠️  LEMBRE-SE: Altere as credenciais de login no início do arquivo!')
  
  // 1. Fazer login
  const authData = await login()
  
  if (!authData || !authData.accessToken) {
    console.log('❌ Não foi possível obter token de autenticação. Verifique as credenciais.')
    return
  }
  
  console.log('🔑 Token obtido:', authData.accessToken.substring(0, 20) + '...')
  
  // 2. Testar API com Bearer Token
  await testAuthenticatedAPI(authData)
  
  // 3. Testar método alternativo
  await testAlternativeAuth(authData)
  
  console.log('\n✅ Testes concluídos!')
}

// Executar testes
runTests()