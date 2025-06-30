import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { Pool } from 'pg'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  let pgPool: Pool | null = null
  
  try {
    // Criar pool PostgreSQL
    pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || 'root'),
      database: process.env.DB_NAME || 'portal_sabercon',
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })

    const pgClient = await pgPool.connect()
    
    try {
      // Buscar roles existentes
      const rolesQuery = `
        SELECT id, name, description, is_active, created_at
        FROM roles 
        WHERE is_active = true
        ORDER BY name
      `
      const rolesResult = await pgClient.query(rolesQuery)
      
      // Buscar estatísticas de usuários por role
      const statsQuery = `
        SELECT 
          r.name as role_name,
          COUNT(u.id) as user_count
        FROM roles r
        LEFT JOIN users u ON u.role_id = r.id
        WHERE r.is_active = true
        GROUP BY r.id, r.name
        ORDER BY r.name
      `
      const statsResult = await pgClient.query(statsQuery)
      
      const roles = rolesResult.rows.map(role => {
        const stats = statsResult.rows.find(s => s.role_name === role.name)
        return {
          ...role,
          user_count: parseInt(stats?.user_count || '0')
        }
      })

      return NextResponse.json({
        success: true,
        roles,
        total: roles.length,
        summary: {
          total_roles: roles.length,
          active_roles: roles.filter(r => r.is_active, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }).length,
          total_users: statsResult.rows.reduce((sum, stat) => sum + parseInt(stat.user_count), 0)
        }
      })

    } finally {
      pgClient.release()
    }

  } catch (error: any) {
    console.error('Erro ao buscar roles PostgreSQL:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao buscar roles do PostgreSQL',
      roles: []
    }, { status: 500 })
    
  } finally {
    if (pgPool) {
      try { await pgPool.end() } catch {}
    }
  }
}
