import { NextResponse } from 'next/server'

const RECENT_ACTIVITIES = [
  { id: 1, type: 'system', message: 'Sistema reiniciado para manutenção', timestamp: '2024-03-20 10:30:00', severity: 'info' },
  { id: 2, type: 'security', message: 'Tentativa de acesso não autorizado bloqueada', timestamp: '2024-03-20 09:15:00', severity: 'warning' },
  { id: 3, type: 'backup', message: 'Backup automático concluído com sucesso', timestamp: '2024-03-20 02:00:00', severity: 'success' },
  { id: 4, type: 'update', message: 'Atualização de segurança aplicada', timestamp: '2024-03-19 18:45:00', severity: 'info' },
  { id: 5, type: 'error', message: 'Erro temporário no serviço de email', timestamp: '2024-03-19 14:20:00', severity: 'error' }
]

export async function GET() {
  // Em um cenário real, isso viria de um sistema de logs ou banco de dados
  return NextResponse.json(RECENT_ACTIVITIES)
}