'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import MigrationLogViewer from '@/components/admin/MigrationLogViewer'
import { UserRole } from '@/types/roles'

// Tipos para a migração
interface MySQLConnection {
  host: string
  port: number
  user: string
  password: string
  database: string
}

interface TableInfo {
  name: string
  rowCount: number
  selected: boolean
  postgresName: string
}

interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue: string | null
  postgresType: string
  postgresName: string
}

interface RoleMapping {
  mysqlRole: string
  postgresRole: string
  fallbackRole?: string
}

interface ColumnMapping {
  mysqlColumn: string
  postgresColumn: string
  mysqlType: string
  postgresType: string
  required: boolean
  defaultValue?: any
}

interface TableStructureMapping {
  mysqlTable: string
  postgresTable: string
  columns: ColumnMapping[]
  customSQL?: string
  recreateStructure: boolean
}

interface MigrationOptions {
  recreateTables: boolean
  preserveData: boolean
}

interface LogEntry {
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
}

export default function MySQLPostgresMigrationPage() {
  const { user } = useAuth()
  
  // Estados da conexão MySQL
  const [mysqlConnection, setMysqlConnection] = useState<MySQLConnection>({
    host: '',
    port: 3306,
    user: '',
    password: '',
    database: ''
  })
  
  // Estados das tabelas e colunas
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [columns, setColumns] = useState<ColumnInfo[]>([])
  const [migrationOptions, setMigrationOptions] = useState<MigrationOptions>({
    recreateTables: false,
    preserveData: true
  })
  
  // Estados de mapeamento
  const [roleMappings, setRoleMappings] = useState<RoleMapping[]>([])
  const [structureMappings, setStructureMappings] = useState<TableStructureMapping[]>([])
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [selectedTableForMapping, setSelectedTableForMapping] = useState<string>('')

  // Estados da UI
  const [activeTab, setActiveTab] = useState<'connection' | 'tables' | 'columns' | 'mapping' | 'migration'>('connection')
  const [connectionTested, setConnectionTested] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [isLoadingColumns, setIsLoadingColumns] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState(0)
  const [envConfigLoaded, setEnvConfigLoaded] = useState(false)
  const [migrationLogs, setMigrationLogs] = useState<LogEntry[]>([])
  const [isCreatingUsers, setIsCreatingUsers] = useState(false)
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  
  // Estados para merge de tabelas e seed
  const [tableMergeConfig, setTableMergeConfig] = useState<Record<string, string[]>>({})
  const [seedDataConfig, setSeedDataConfig] = useState<Record<string, boolean>>({})
  const [isGeneratingSeed, setIsGeneratingSeed] = useState(false)
  const [realTimeProgress, setRealTimeProgress] = useState<Record<string, number>>({})

  // Computed properties
  const selectedTables = tables.filter(t => t.selected)
  const totalRows = selectedTables.reduce((sum, t) => sum + t.rowCount, 0)

  // Carregar configurações do .env ao montar o componente
  useEffect(() => {
    loadEnvConfig()
    loadAvailableRoles()
  }, [])

  const loadAvailableRoles = async () => {
    setIsLoadingRoles(true)
    try {
      const response = await fetch('/api/migration/get-postgres-roles')
      const data = await response.json()
      
      if (data.success) {
        const roleNames = data.roles.map((role: any) => role.name)
        setAvailableRoles(roleNames)
        addLog('info', `🎭 ${roleNames.length} roles encontrados no PostgreSQL: ${roleNames.join(', ')}`)
      } else {
        addLog('warning', '⚠️ Não foi possível carregar roles do PostgreSQL')
        // Definir roles padrão
        setAvailableRoles(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER', 'STUDENT', 'GUARDIAN', 'COORDINATOR'])
      }
    } catch (error) {
      console.error('Erro ao carregar roles:', error)
      addLog('error', '❌ Erro ao carregar roles do PostgreSQL')
      // Definir roles padrão em caso de erro
      setAvailableRoles(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER', 'STUDENT', 'GUARDIAN', 'COORDINATOR'])
    } finally {
      setIsLoadingRoles(false)
    }
  }

  const createDefaultUsers = async () => {
    setIsCreatingUsers(true)
    addLog('info', '🚀 Iniciando criação automática de usuários padrão...')
    
    try {
      const response = await fetch('/api/admin/create-default-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await response.json()
      
      if (result.success) {
        addLog('success', `🎉 ${result.usersCreated} usuários padrão criados com sucesso!`)
        
        if (result.tablesUsed?.length > 0) {
          addLog('info', `📊 Tabelas utilizadas: ${result.tablesUsed.join(', ')}`)
        }
        
        addLog('info', '👥 Usuários disponíveis:')
        result.users?.forEach((user: any) => {
          const tableInfo = user.tables ? ` [${user.tables.join(', ')}]` : ''
          const statusIcon = user.status === 'created' ? '✅' : '🔄'
          addLog('info', `   ${statusIcon} ${user.email} (${user.role})${tableInfo}`)
        })
        addLog('info', '🔑 Senha padrão para todos: password123')
        addLog('success', '✅ Sistema pronto para uso!')
      } else {
        addLog('error', `❌ Erro ao criar usuários: ${result.error}`)
      }
    } catch (error: any) {
      addLog('error', `❌ Erro de rede: ${error.message}`)
    } finally {
      setIsCreatingUsers(false)
    }
  }

  const loadEnvConfig = async () => {
    try {
      addLog('info', '🔧 Carregando configurações do arquivo .env...')
      
      const response = await fetch('/api/migration/get-env-config')
      const data = await response.json()
      
      if (data.success && data.config) {
        setMysqlConnection({
          host: data.config.mysql.host,
          port: data.config.mysql.port,
          user: data.config.mysql.user,
          password: data.config._passwords.mysql,
          database: data.config.mysql.database
        })
        
        setEnvConfigLoaded(true)
        addLog('success', `✅ Configurações MySQL carregadas: ${data.config.mysql.host}:${data.config.mysql.port}`)
        addLog('info', `📊 Banco MySQL: ${data.config.mysql.database} (usuário: ${data.config.mysql.user})`)
      } else {
        addLog('warning', '⚠️ Não foi possível carregar configurações do .env')
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      addLog('error', '❌ Erro ao carregar configurações do .env')
    }
  }

  const reloadEnvConfig = () => {
    setEnvConfigLoaded(false)
    loadEnvConfig()
  }

  const addLog = (level: LogEntry['level'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    }
    setMigrationLogs(prev => [...prev, newLog])
  }

  const clearLogs = () => {
    setMigrationLogs([])
  }

  const testConnection = async () => {
    setIsTestingConnection(true)
    addLog('info', 'Testando conexão com MySQL...')
    
    try {
      const response = await fetch('/api/migration/test-mysql-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mysqlConnection)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setConnectionTested(true)
        addLog('success', `Conexão MySQL estabelecida! ${result.tableCount} tabelas encontradas`)
        setActiveTab('tables')
        await loadTables()
      } else {
        addLog('error', `Falha na conexão MySQL: ${result.error}`)
      }
    } catch (error: any) {
      addLog('error', `Erro de rede: ${error.message}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const loadTables = async () => {
    setIsLoadingTables(true)
    addLog('info', 'Carregando lista de tabelas MySQL...')
    
    try {
      const response = await fetch('/api/migration/mysql-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mysqlConnection)
      })
      
      const result = await response.json()
      
      if (result.success) {
        const tableList: TableInfo[] = result.tables.map((table: any) => ({
          name: table.name,
          rowCount: table.rowCount || 0,
          selected: true, // Por padrão, todas selecionadas
          postgresName: normalizeTableName(table.name)
        }))
        
        setTables(tableList)
        addLog('success', `${tableList.length} tabelas carregadas, ${result.totalRows?.toLocaleString() || 0} registros estimados`)
      } else {
        addLog('error', 'Erro ao carregar tabelas MySQL')
      }
    } catch (error: any) {
      addLog('error', `Erro ao carregar tabelas: ${error.message}`)
    } finally {
      setIsLoadingTables(false)
    }
  }

  const normalizeTableName = (mysqlName: string): string => {
    const mapping: Record<string, string> = {
      // Mapeamento CRÍTICO: user → users (mais importante)
      'user': 'users',
      
      // Outros mapeamentos importantes
      'file': 'files',
      'video': 'videos',
      'institution': 'institutions',
      'unit': 'schools',
      'tv_show': 'collections',
      
      // Mapeamentos de roles e perfis
      'roles': 'roles',
      'role': 'roles',
      'profile': 'profile',

      // Mapeamentos de conteúdo
      'livros': 'books',
      'livro': 'books',
      'books': 'books',
      'book': 'books',
      
      // Mapeamentos de turmas e classes
      'turmas': 'classes',
      'turma': 'classes',
      'classes': 'classes',
      'class': 'classes'
    }
    
    const normalized = mapping[mysqlName.toLowerCase()] || mysqlName.toLowerCase()
    
    // Log do mapeamento para debug
    if (mapping[mysqlName.toLowerCase()]) {
      addLog('info', `🔄 Mapeamento de tabela: ${mysqlName} → ${normalized}`)
    }
    
    return normalized
  }

  const toggleTableSelection = (tableName: string) => {
    setTables(prev => prev.map(table => 
      table.name === tableName 
        ? { ...table, selected: !table.selected }
        : table
    ))
  }

  const loadColumns = async (tableName: string) => {
    setIsLoadingColumns(true)
    addLog('info', `Carregando colunas da tabela ${tableName}...`)
    
    try {
      const response = await fetch('/api/migration/mysql-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mysqlConnection, tableName })
      })
      
      const result = await response.json()
      
      if (result.success) {
        const columnList: ColumnInfo[] = result.columns.map((col: any) => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable,
          defaultValue: col.defaultValue,
          postgresType: mapMySQLTypeToPostgreSQL(col.type),
          postgresName: normalizeColumnName(col.name)
        }))
        
        setColumns(columnList)
        addLog('success', `${columnList.length} colunas carregadas para ${tableName}`)
      } else {
        addLog('error', `Erro ao carregar colunas de ${tableName}`)
      }
    } catch (error: any) {
      addLog('error', `Erro ao carregar colunas: ${error.message}`)
    } finally {
      setIsLoadingColumns(false)
    }
  }

  const normalizeColumnName = (mysqlName: string): string => {
    return mysqlName.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  }

  const mapMySQLTypeToPostgreSQL = (mysqlType: string): string => {
    const type = mysqlType.toLowerCase()
    
    if (type.includes('bit(1)')) return 'boolean'
    if (type.includes('tinyint(1)')) return 'boolean'
    if (type.includes('int')) return 'integer'
    if (type.includes('bigint')) return 'bigint'
    if (type.includes('varchar')) return 'varchar'
    if (type.includes('text')) return 'text'
    if (type.includes('datetime') || type.includes('timestamp')) return 'timestamp'
    if (type.includes('decimal')) return 'decimal'
    if (type.includes('float')) return 'real'
    if (type.includes('double')) return 'double precision'
    if (type.includes('json')) return 'jsonb'
    
    return 'text' // Fallback
  }

  const addRoleMapping = () => {
    const newMapping: RoleMapping = {
      mysqlRole: '',
      postgresRole: 'STUDENT',
      fallbackRole: 'STUDENT'
    }
    setRoleMappings(prev => [...prev, newMapping])
  }

  const updateRoleMapping = (index: number, field: keyof RoleMapping, value: string) => {
    setRoleMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, [field]: value } : mapping
    ))
  }

  const removeRoleMapping = (index: number) => {
    setRoleMappings(prev => prev.filter((_, i) => i !== index))
  }

  const addTableStructureMapping = (tableName: string) => {
    const newMapping: TableStructureMapping = {
      mysqlTable: tableName,
      postgresTable: normalizeTableName(tableName),
      columns: [],
      recreateStructure: false
    }
    setStructureMappings(prev => [...prev, newMapping])
    setSelectedTableForMapping(tableName)
    setShowMappingModal(true)
  }

  const updateStructureMapping = (tableName: string, mapping: Partial<TableStructureMapping>) => {
    setStructureMappings(prev => prev.map(sm => 
      sm.mysqlTable === tableName ? { ...sm, ...mapping } : sm
    ))
  }

  const detectMySQLRoles = async () => {
    if (!connectionTested) {
      addLog('warning', '⚠️ Teste a conexão MySQL primeiro')
      return
    }

    addLog('info', '🔍 Detectando roles no MySQL...')
    
    try {
      // Buscar roles na tabela 'user' (se existir)
      const userRolesResponse = await fetch('/api/migration/mysql-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mysqlConnection, tableName: 'user' })
      })
      
      if (userRolesResponse.ok) {
        const userRolesData = await userRolesResponse.json()
        if (userRolesData.success) {
          // Buscar valores únicos da coluna role
          const dataResponse = await fetch('/api/migration/mysql-tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mysqlConnection)
          })
          
          if (dataResponse.ok) {
            const dataResult = await dataResponse.json()
            // Aqui você pode processar os dados para extrair roles únicos
            addLog('success', '✅ Detecção de roles MySQL concluída')
            addLog('info', '💡 Adicione os mapeamentos manualmente com base nos dados encontrados')
          }
        }
      }
      
      // Buscar na tabela 'role' ou 'roles' se existir
      const roleTableResponse = await fetch('/api/migration/mysql-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mysqlConnection, tableName: 'role' })
      })
      
      if (roleTableResponse.ok) {
        const roleTableData = await roleTableResponse.json()
        if (roleTableData.success) {
          addLog('info', '📋 Tabela "role" encontrada no MySQL')
        }
      }
      
    } catch (error: any) {
      addLog('error', `❌ Erro na detecção: ${error.message}`)
    }
  }

  // Função para configurar merge de tabelas
  const configureMergeTable = (sourceTable: string, targetTables: string[]) => {
    setTableMergeConfig(prev => ({
      ...prev,
      [sourceTable]: targetTables
    }))
    addLog('info', `🔗 Configurado merge: ${sourceTable} → [${targetTables.join(', ')}]`)
  }

  // Função para gerar seed de dados
  const generateSeedData = async () => {
    setIsGeneratingSeed(true)
    addLog('info', '🌱 Iniciando geração de dados seed...')
    
    try {
      const response = await fetch('/api/migration/generate-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedTables: selectedTables.map(t => t.name),
          seedConfig: seedDataConfig
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        addLog('success', `🌱 Seed gerado com sucesso! ${result.recordsGenerated} registros criados`)
        result.details?.forEach((detail: any) => {
          addLog('info', `   • ${detail.table}: ${detail.records} registros`)
        })
      } else {
        addLog('error', `❌ Erro ao gerar seed: ${result.error}`)
      }
    } catch (error: any) {
      addLog('error', `❌ Erro de rede ao gerar seed: ${error.message}`)
    } finally {
      setIsGeneratingSeed(false)
    }
  }

  // Função para auto-configurar merge user → users
  const autoConfigureUserMerge = () => {
    const userTable = tables.find(t => t.name.toLowerCase() === 'user')
    const usersTable = tables.find(t => t.name.toLowerCase() === 'users')
    
    if (userTable && !usersTable) {
      // Se só existe 'user', mapear para 'users'
      configureMergeTable('user', ['users'])
      addLog('success', '✅ Auto-configurado: tabela "user" será migrada para "users"')
    } else if (userTable && usersTable) {
      // Se existem ambas, mesclar 'user' em 'users'
      configureMergeTable('user', ['users'])
      addLog('success', '✅ Auto-configurado: dados de "user" serão mesclados em "users"')
    }
    
    // Configurar outros merges comuns
    const commonMerges = [
      { from: 'usuario', to: ['users'] },
      { from: 'usuarios', to: ['users'] },
      { from: 'role', to: ['roles'] },
      { from: 'perfil', to: ['roles'] },
      { from: 'arquivo', to: ['files'] },
      { from: 'livro', to: ['books'] }
    ]
    
    commonMerges.forEach(merge => {
      const sourceTable = tables.find(t => t.name.toLowerCase() === merge.from)
      if (sourceTable) {
        configureMergeTable(merge.from, merge.to)
        addLog('info', `🔄 Auto-configurado merge: ${merge.from} → ${merge.to.join(', ')}`)
      }
    })
  }

  // Função para atualizar progresso em tempo real
  const updateRealTimeProgress = (tableName: string, progress: number) => {
    setRealTimeProgress(prev => ({
      ...prev,
      [tableName]: progress
    }))
    
    // Atualizar log com progresso
    addLog('info', `📊 ${tableName}: ${progress.toFixed(1)}% concluído`)
  }

  const executeMigration = async () => {
    setIsMigrating(true)
    setMigrationProgress(0)
    addLog('info', `🚀 Iniciando migração de ${selectedTables.length} tabelas...`)
    
    // Log dos mapeamentos configurados
    if (roleMappings.length > 0) {
      addLog('info', `🎭 Mapeamentos de roles configurados: ${roleMappings.length}`)
      roleMappings.forEach(rm => {
        addLog('info', `   • ${rm.mysqlRole} → ${rm.postgresRole}`)
      })
    }
    
    if (structureMappings.length > 0) {
      addLog('info', `🗂️ Mapeamentos de estrutura configurados: ${structureMappings.length}`)
      structureMappings.forEach(sm => {
        addLog('info', `   • ${sm.mysqlTable} → ${sm.postgresTable} (${sm.columns.length} colunas)`)
      })
    }
    
    try {
      const response = await fetch('/api/migration/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mysqlConnection,
          selectedTables: selectedTables.map(t => ({
            mysqlTable: t.name,
            postgresTable: t.postgresName
          })),
          options: migrationOptions,
          roleMappings,
          structureMappings
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMigrationProgress(100)
        addLog('success', `🎉 Migração concluída! ${result.tablesProcessed} tabelas processadas, ${result.totalRows} registros migrados`)
        addLog('info', `⏱️ Tempo total: ${(result.duration / 1000).toFixed(2)}s`)
      } else {
        addLog('error', '❌ Migração falhou')
        result.errors?.forEach((error: string) => addLog('error', error))
        result.warnings?.forEach((warning: string) => addLog('warning', warning))
      }
    } catch (error: any) {
      addLog('error', `Erro durante migração: ${error.message}`)
    } finally {
      setIsMigrating(false)
      setMigrationProgress(0)
    }
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="Migração MySQL → PostgreSQL"
        subtitle="Migre dados completos do MySQL para PostgreSQL de forma segura e inteligente"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Migração MySQL → PostgreSQL</h1>
              <p className="text-gray-600 mt-2">
                Migre dados completos do MySQL para PostgreSQL de forma segura e inteligente
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={createDefaultUsers}
                disabled={isCreatingUsers}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isCreatingUsers ? (
                  <>
                    <span className="animate-spin">🔄</span>
                    Criando...
                  </>
                ) : (
                  <>
                    <span>👥</span>
                    Criar Usuários Padrão
                  </>
                )}
              </button>
              <button
                onClick={reloadEnvConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 Recarregar .env
              </button>
            </div>
          </div>

          {/* Seção de Usuários Padrão */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">👥 Usuários Padrão do Sistema</h3>
                <p className="text-gray-600 mt-1">
                  Crie automaticamente todos os usuários padrão nas tabelas "users" e "user" (se existirem) para garantir compatibilidade total
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👑</span>
                  <span className="font-semibold text-red-800">SYSTEM_ADMIN</span>
                </div>
                <p className="text-sm text-red-700 mb-2">admin@sabercon.edu.br</p>
                <p className="text-xs text-red-600">Acesso completo ao sistema</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏢</span>
                  <span className="font-semibold text-blue-800">INSTITUTION_MANAGER</span>
                </div>
                <p className="text-sm text-blue-700 mb-2">gestor@sabercon.edu.br</p>
                <p className="text-xs text-blue-600">Gerencia operações institucionais</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👨‍🏫</span>
                  <span className="font-semibold text-green-800">TEACHER</span>
                </div>
                <p className="text-sm text-green-700 mb-2">professor@sabercon.edu.br</p>
                <p className="text-xs text-green-600">Professor com acesso a turmas</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎓</span>
                  <span className="font-semibold text-purple-800">STUDENT</span>
                </div>
                <p className="text-sm text-purple-700 mb-2">julia.c@ifsp.com</p>
                <p className="text-xs text-purple-600">Estudante do IFSP</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📚</span>
                  <span className="font-semibold text-yellow-800">COORDINATOR</span>
                </div>
                <p className="text-sm text-yellow-700 mb-2">coordenador@sabercon.edu.com</p>
                <p className="text-xs text-yellow-600">Coordena atividades acadêmicas</p>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👨‍👩‍👧‍👦</span>
                  <span className="font-semibold text-pink-800">GUARDIAN</span>
                </div>
                <p className="text-sm text-pink-700 mb-2">renato@gmail.com</p>
                <p className="text-xs text-pink-600">Responsável por estudante</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>🔄 Compatibilidade Garantida:</strong> Os usuários serão criados em ambas as tabelas "users" e "user" (se existirem) para garantir funcionamento com diferentes estruturas de banco
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>🔑 Senha padrão:</strong> password123 (para todos os usuários)
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  ⚠️ Recomenda-se alterar as senhas após o primeiro login
                </p>
              </div>
            </div>
          </div>

          {/* Status das Configurações do .env */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">⚙️ Status das Configurações</h3>
            {envConfigLoaded ? (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-green-800">
                    ✅ Configurações carregadas automaticamente do arquivo .env
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <h4 className="font-semibold text-blue-800">MySQL (Origem)</h4>
                    <p className="text-sm text-blue-600">
                      📍 {mysqlConnection.host}:{mysqlConnection.port}<br/>
                      📊 {mysqlConnection.database} ({mysqlConnection.user})
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <h4 className="font-semibold text-purple-800">PostgreSQL (Destino)</h4>
                    <p className="text-sm text-purple-600">
                      📍 Configurado no .env<br/>
                      📊 Banco de destino pronto
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800">
                  ⚠️ Configurações não carregadas. Preencha manualmente na aba "Conexão MySQL"
                </p>
              </div>
            )}
          </div>

          {/* Seção de Merge de Tabelas e Seed */}
          {connectionTested && tables.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔗 Configurações Avançadas</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Merge de Tabelas */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-blue-800">🔄 Merge de Tabelas</h4>
                    <button
                      onClick={autoConfigureUserMerge}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Auto-configurar
                    </button>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Configure quais tabelas MySQL devem ser mescladas em tabelas PostgreSQL existentes
                  </p>
                  
                  {/* Mapeamento user → users destacado */}
                  <div className="bg-green-100 border border-green-300 rounded p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 font-medium">✅ Mapeamento Crítico:</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <strong>user → users</strong> (Tabela de usuários unificada)
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Todos os dados da tabela "user" serão migrados para "users"
                    </div>
                  </div>

                  {/* Lista de merges configurados */}
                  {Object.keys(tableMergeConfig).length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-blue-800">Merges Configurados:</div>
                      {Object.entries(tableMergeConfig).map(([source, targets]) => (
                        <div key={source} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-sm">
                            <span className="font-medium">{source}</span> → {targets.join(', ')}
                          </span>
                          <button
                            onClick={() => {
                              const newConfig = { ...tableMergeConfig }
                              delete newConfig[source]
                              setTableMergeConfig(newConfig)
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Geração de Seed */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-green-800">🌱 Dados Seed</h4>
                    <button
                      onClick={generateSeedData}
                      disabled={isGeneratingSeed}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {isGeneratingSeed ? '🔄 Gerando...' : 'Gerar Seed'}
                    </button>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Gere dados de exemplo para testar o sistema após a migração
                  </p>
                  
                  {/* Opções de seed */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={seedDataConfig.users || false}
                        onChange={(e) => setSeedDataConfig(prev => ({ ...prev, users: e.target.checked }))}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-green-700">Usuários de teste</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={seedDataConfig.institutions || false}
                        onChange={(e) => setSeedDataConfig(prev => ({ ...prev, institutions: e.target.checked }))}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-green-700">Instituições de exemplo</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={seedDataConfig.content || false}
                        onChange={(e) => setSeedDataConfig(prev => ({ ...prev, content: e.target.checked }))}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-green-700">Conteúdo de demonstração</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navegação por Abas */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('connection')}
                  className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 ${
                    activeTab === 'connection' ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  🔌 Conexão MySQL
                  {envConfigLoaded && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      .env
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 ${
                    activeTab === 'tables' ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  disabled={!connectionTested}
                >
                  📊 Selecionar Tabelas
                  {tables.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {selectedTables.length}/{tables.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('columns')}
                  className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 ${
                    activeTab === 'columns' ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  disabled={selectedTables.length === 0}
                >
                  🗂️ Mapear Colunas
                </button>
                <button
                  onClick={() => setActiveTab('mapping')}
                  className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 ${
                    activeTab === 'mapping' ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  disabled={selectedTables.length === 0}
                >
                  🎭 Mapeamento Avançado
                  {(roleMappings.length > 0 || structureMappings.length > 0) && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {roleMappings.length + structureMappings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('migration')}
                  className={`px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 ${
                    activeTab === 'migration' ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  disabled={selectedTables.length === 0}
                >
                  🚀 Executar Migração
                </button>
              </div>
            </nav>
          </div>

          {/* Barra de Progresso em Tempo Real */}
          {isMigrating && (
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Progresso da Migração em Tempo Real</h3>
              
              {/* Progresso Geral */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
                  <span className="text-sm text-gray-600">{Math.round(migrationProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                    style={{ width: `${migrationProgress}%` }}
                  >
                    {migrationProgress > 10 && (
                      <span className="text-white text-xs font-medium">
                        {Math.round(migrationProgress)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progresso por Tabela */}
              {Object.keys(realTimeProgress).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Progresso por Tabela:</h4>
                  <div className="space-y-3">
                    {Object.entries(realTimeProgress).map(([tableName, progress]) => (
                      <div key={tableName} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{tableName}</span>
                          <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conteúdo das abas */}
          <div className="mt-6">
            {/* Tab 1: Conexão MySQL */}
            {activeTab === 'connection' && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Configuração da Conexão MySQL</h3>
                    <p className="text-gray-600">
                      Configure os dados de conexão com o banco MySQL de origem.
                    </p>
                  </div>
                  <button
                    onClick={reloadEnvConfig}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    🔄 Recarregar .env
                  </button>
                </div>
                
                {envConfigLoaded && (
                  <div className="bg-green-100 border border-green-300 rounded p-3 my-4">
                    <p className="text-green-800 text-sm">
                      ✅ Dados carregados automaticamente do .env
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                    <input
                      type="text"
                      value={mysqlConnection.host}
                      onChange={(e) => setMysqlConnection(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Porta</label>
                    <input
                      type="number"
                      value={mysqlConnection.port}
                      onChange={(e) => setMysqlConnection(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      placeholder="3306"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                    <input
                      type="text"
                      value={mysqlConnection.user}
                      onChange={(e) => setMysqlConnection(prev => ({ ...prev, user: e.target.value }))}
                      placeholder="root"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                      type="password"
                      value={mysqlConnection.password}
                      onChange={(e) => setMysqlConnection(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Digite a senha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banco de Dados</label>
                    <input
                      type="text"
                      value={mysqlConnection.database}
                      onChange={(e) => setMysqlConnection(prev => ({ ...prev, database: e.target.value }))}
                      placeholder="portal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isTestingConnection ? '🔄 Testando...' : '🔍 Testar Conexão'}
                  </button>
                  
                  <button
                    onClick={reloadEnvConfig}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    🔄 Recarregar .env
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Selecionar Tabelas */}
            {activeTab === 'tables' && connectionTested && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📊 Selecionar Tabelas para Migração</h3>
                    <p className="text-gray-600 mt-2">Escolha quais tabelas serão migradas do MySQL para PostgreSQL</p>
                  </div>
                  {isLoadingTables && (
                    <div className="text-blue-600">🔄 Carregando...</div>
                  )}
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{tables.length}</div>
                    <div className="text-blue-600 text-sm">Tabelas Encontradas</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedTables.length}</div>
                    <div className="text-green-600 text-sm">Tabelas Selecionadas</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{totalRows.toLocaleString()}</div>
                    <div className="text-purple-600 text-sm">Registros Estimados</div>
                  </div>
                </div>

                {/* Lista de Tabelas */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tables.map((table) => (
                    <div
                      key={table.name}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        table.selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleTableSelection(table.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={table.selected}
                            onChange={() => toggleTableSelection(table.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{table.name}</div>
                            <div className="text-sm text-gray-500">
                              → {table.postgresName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {table.rowCount.toLocaleString()} registros
                          </div>
                          <div className="text-xs text-gray-500">estimados</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setActiveTab('connection')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => setActiveTab('columns')}
                    disabled={selectedTables.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Mapear Colunas */}
            {activeTab === 'columns' && selectedTables.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🗂️ Mapeamento de Colunas</h3>
                <p className="text-gray-600 mb-6">Revise e ajuste o mapeamento de colunas entre MySQL e PostgreSQL</p>
                
                {/* Informações sobre mapeamento automático */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    🔧 Mapeamento Automático de Tipos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <p><strong>Tipos Booleanos:</strong></p>
                      <p>• bit(1) → boolean ✅</p>
                      <p>• tinyint(1) → boolean</p>
                    </div>
                    <div>
                      <p><strong>Tipos Inteiros:</strong></p>
                      <p>• int → integer</p>
                      <p>• bigint → bigint</p>
                    </div>
                    <div>
                      <p><strong>Tipos de Texto:</strong></p>
                      <p>• varchar(n) → varchar(n)</p>
                      <p>• text → text</p>
                    </div>
                    <div>
                      <p><strong>Tipos Especiais:</strong></p>
                      <p>• json → jsonb</p>
                      <p>• datetime → timestamp</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-green-100 rounded">
                    <p className="text-green-800 text-sm">
                      ✅ <strong>Novo:</strong> Campos bit(1) do MySQL são automaticamente convertidos para boolean no PostgreSQL
                    </p>
                  </div>
                </div>

                {/* Seletor de Tabela */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione uma tabela para revisar as colunas:
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => {
                      setSelectedTable(e.target.value)
                      if (e.target.value) {
                        loadColumns(e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Escolha uma tabela...</option>
                    {selectedTables.map((table) => (
                      <option key={table.name} value={table.name}>
                        {table.name} → {table.postgresName} ({table.rowCount.toLocaleString()} registros)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tabela de Colunas */}
                {selectedTable && (
                  <div>
                    {isLoadingColumns ? (
                      <div className="text-center py-8">
                        <div className="text-blue-600">🔄 Carregando colunas...</div>
                      </div>
                    ) : columns.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Coluna MySQL</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo MySQL</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Coluna PostgreSQL</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tipo PostgreSQL</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nullable</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Padrão</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {columns.map((column, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {column.name}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    column.type.includes('bit(1)') || column.type.includes('tinyint(1)') 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {column.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {column.postgresName}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    column.postgresType === 'boolean' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {column.postgresType}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    column.nullable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {column.nullable ? 'Sim' : 'Não'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {column.defaultValue || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Nenhuma coluna encontrada
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setActiveTab('tables')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => setActiveTab('migration')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Mapeamento Avançado */}
            {activeTab === 'mapping' && selectedTables.length > 0 && (
              <div className="space-y-6">
                {/* Seção de Mapeamento de Roles */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">🎭 Mapeamento de Roles</h3>
                      <p className="text-gray-600 mt-1">
                        Configure como os roles do MySQL devem ser convertidos para PostgreSQL
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={detectMySQLRoles}
                        disabled={!connectionTested}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                      >
                        🔍 Detectar Roles MySQL
                      </button>
                      <button
                        onClick={addRoleMapping}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        + Adicionar Manual
                      </button>
                    </div>
                  </div>

                  {roleMappings.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <div className="text-gray-500 mb-2">🎭</div>
                      <p className="text-gray-600 mb-3">Nenhum mapeamento de role configurado</p>
                      <p className="text-sm text-gray-500">
                        O sistema usará mapeamento automático baseado em padrões comuns
                      </p>
                      <button
                        onClick={addRoleMapping}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Configurar Mapeamento Manual
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {roleMappings.map((mapping, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role MySQL</label>
                            <input
                              type="text"
                              value={mapping.mysqlRole}
                              onChange={(e) => updateRoleMapping(index, 'mysqlRole', e.target.value)}
                              placeholder="Ex: admin, professor, 1"
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role PostgreSQL</label>
                            <select
                              value={mapping.postgresRole}
                              onChange={(e) => updateRoleMapping(index, 'postgresRole', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              {isLoadingRoles ? (
                                <option value="">Carregando...</option>
                              ) : (
                                availableRoles.map(role => (
                                  <option key={role} value={role}>{role}</option>
                                ))
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fallback</label>
                            <select
                              value={mapping.fallbackRole || 'STUDENT'}
                              onChange={(e) => updateRoleMapping(index, 'fallbackRole', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              {availableRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => removeRoleMapping(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                            >
                              🗑️ Remover
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">💡 Mapeamento Automático Ativo</h4>
                        <div className="text-sm text-blue-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>• admin → SYSTEM_ADMIN</div>
                          <div>• professor → TEACHER</div>
                          <div>• aluno → STUDENT</div>
                          <div>• gestor → INSTITUTION_MANAGER</div>
                          <div>• pai/responsavel → GUARDIAN</div>
                          <div>• coordenador → COORDINATOR</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seção de Mapeamento de Estrutura de Tabelas */}
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">🗂️ Estrutura de Tabelas</h3>
                      <p className="text-gray-600 mt-1">
                        Personalize a estrutura das tabelas PostgreSQL ou adicione colunas necessárias
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTables.map((table) => {
                      const hasMapping = structureMappings.some(sm => sm.mysqlTable === table.name)
                      return (
                        <div key={table.name} className={`p-4 border rounded-lg ${hasMapping ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium text-gray-900">{table.name}</div>
                              <div className="text-sm text-gray-500">→ {table.postgresName}</div>
                            </div>
                            {hasMapping && <span className="text-green-600 text-sm">✅ Configurado</span>}
                          </div>
                          <button
                            onClick={() => addTableStructureMapping(table.name)}
                            className={`w-full px-3 py-2 text-sm rounded ${
                              hasMapping 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {hasMapping ? '🔧 Editar Estrutura' : '⚙️ Configurar Estrutura'}
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {structureMappings.length > 0 && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">📋 Estruturas Configuradas</h4>
                      <div className="space-y-2">
                        {structureMappings.map((mapping) => (
                          <div key={mapping.mysqlTable} className="flex justify-between items-center p-3 bg-white rounded border">
                            <div>
                              <span className="font-medium">{mapping.mysqlTable}</span>
                              <span className="text-gray-500 mx-2">→</span>
                              <span className="text-blue-600">{mapping.postgresTable}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                ({mapping.columns.length} colunas)
                              </span>
                            </div>
                            <button
                              onClick={() => addTableStructureMapping(mapping.mysqlTable)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Editar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setActiveTab('columns')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => setActiveTab('migration')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            )}

            {/* Tab 5: Executar Migração */}
            {activeTab === 'migration' && selectedTables.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Executar Migração</h3>
                <p className="text-gray-600 mb-6">Revise as configurações e execute a migração dos dados</p>

                {/* Opções de Migração */}
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">⚙️ Opções de Migração</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="recreateTables"
                        checked={migrationOptions.recreateTables}
                        onChange={(e) => setMigrationOptions(prev => ({ 
                          ...prev, 
                          recreateTables: e.target.checked,
                          preserveData: e.target.checked ? false : prev.preserveData
                        }))}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <label htmlFor="recreateTables" className="font-medium text-gray-900 cursor-pointer">
                          Recriar Tabelas (DROP CASCADE)
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Remove tabelas existentes e recria do zero. <strong className="text-red-600">ATENÇÃO:</strong> Remove todos os dados existentes e dependências.
                        </p>
                      </div>
                    </div>
                    
                    {!migrationOptions.recreateTables && (
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="preserveData"
                          checked={migrationOptions.preserveData}
                          onChange={(e) => setMigrationOptions(prev => ({ ...prev, preserveData: e.target.checked }))}
                          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div>
                          <label htmlFor="preserveData" className="font-medium text-gray-900 cursor-pointer">
                            Preservar Dados Existentes
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Evita duplicar dados já existentes no PostgreSQL. Recomendado para migrações incrementais.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {migrationOptions.recreateTables && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-800">
                          <span className="text-sm">⚠️</span>
                          <span className="font-medium">ATENÇÃO: Operação Destrutiva</span>
                        </div>
                        <p className="text-red-700 text-sm mt-2">
                          Esta opção irá <strong>DELETAR PERMANENTEMENTE</strong> todas as tabelas selecionadas e seus dados no PostgreSQL, 
                          incluindo tabelas dependentes (CASCADE). Use apenas se tiver certeza absoluta.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumo da Migração */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">📋 Resumo da Migração</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Servidor MySQL:</div>
                      <div className="font-medium">{mysqlConnection.host}:{mysqlConnection.port}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Banco de Dados:</div>
                      <div className="font-medium">{mysqlConnection.database}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Tabelas Selecionadas:</div>
                      <div className="font-medium">{selectedTables.length} de {tables.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Registros Estimados:</div>
                      <div className="font-medium">{totalRows.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Lista de Tabelas Selecionadas */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">📊 Tabelas que serão migradas:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div>
                          <span className="font-medium">{table.name}</span>
                          <span className="text-gray-500 mx-2">→</span>
                          <span className="text-blue-600">{table.postgresName}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {table.rowCount.toLocaleString()} registros
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Barra de Progresso */}
                {isMigrating && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progresso da Migração</span>
                      <span className="text-sm text-gray-600">{Math.round(migrationProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${migrationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setActiveTab('mapping')}
                    disabled={isMigrating}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Voltar
                  </button>
                  
                  <button
                    onClick={executeMigration}
                    disabled={isMigrating || selectedTables.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isMigrating ? (
                      <>
                        <span className="animate-spin">🔄</span>
                        Migrando...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        Iniciar Migração
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logs da Migração */}
          <div className="mt-8">
            <MigrationLogViewer
              logs={migrationLogs}
              isActive={isMigrating}
              onClear={clearLogs}
            />
          </div>

          {/* Modal de Configuração de Estrutura */}
          {showMappingModal && selectedTableForMapping && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        🗂️ Configurar Estrutura: {selectedTableForMapping}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Personalize a estrutura da tabela PostgreSQL ou adicione colunas necessárias
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMappingModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Opções de Estrutura */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-3">⚙️ Opções de Estrutura</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600"
                            onChange={(e) => {
                              const mapping = structureMappings.find(sm => sm.mysqlTable === selectedTableForMapping)
                              if (mapping) {
                                updateStructureMapping(selectedTableForMapping, { recreateStructure: e.target.checked })
                              }
                            }}
                          />
                          <div>
                            <span className="font-medium text-blue-800">Recriar estrutura customizada</span>
                            <p className="text-sm text-blue-600">
                              Use estrutura personalizada em vez de copiar do MySQL
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Colunas Essenciais para Sistema */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3">✅ Colunas Recomendadas para o Sistema</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-green-700 mb-2">Para tabela 'users':</h5>
                          <div className="text-sm text-green-600 space-y-1">
                            <div>• id (integer, auto-increment)</div>
                            <div>• email (varchar, unique)</div>
                            <div>• password (varchar)</div>
                            <div>• name (varchar)</div>
                            <div>• role_id (integer, FK)</div>
                            <div>• institution_id (integer, FK)</div>
                            <div>• is_active (boolean, default true)</div>
                            <div>• created_at (timestamp)</div>
                            <div>• updated_at (timestamp)</div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-green-700 mb-2">Para tabela 'roles':</h5>
                          <div className="text-sm text-green-600 space-y-1">
                            <div>• id (integer, auto-increment)</div>
                            <div>• name (varchar, unique)</div>
                            <div>• description (text)</div>
                            <div>• permissions (jsonb)</div>
                            <div>• is_active (boolean, default true)</div>
                            <div>• created_at (timestamp)</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SQL Customizado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SQL Customizado (Opcional)
                      </label>
                      <textarea
                        rows={10}
                        placeholder={`CREATE TABLE IF NOT EXISTS "{tableName}" (
  "id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  "email" varchar(255) NOT NULL,
  "password" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "role_id" integer,
  "institution_id" integer,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("email")
);`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          updateStructureMapping(selectedTableForMapping, { customSQL: e.target.value })
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Use <code>{"{tableName}"}</code> como placeholder para o nome da tabela
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => setShowMappingModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        // Criar mapeamento se não existir
                        if (!structureMappings.some(sm => sm.mysqlTable === selectedTableForMapping)) {
                          addTableStructureMapping(selectedTableForMapping)
                        }
                        setShowMappingModal(false)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Salvar Configuração
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  )
} 