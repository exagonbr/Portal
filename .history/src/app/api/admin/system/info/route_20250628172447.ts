import { NextResponse } from 'next/server'

// Em um cenário real, esses dados viriam de um serviço de monitoramento
const SYSTEM_INFO = {
  version: '2.1.4',
  buildDate: '2024-03-20',
  environment: 'Production',
  uptime: '15 dias, 8 horas',
  lastRestart: '2024-03-05 14:30:00',
  database: {
    type: 'PostgreSQL',
    version: '15.2',
    size: '2.8 GB',
    connections: 45,
    maxConnections: 100
  },
  server: {
    cpu: 35,
    memory: 68,
    disk: 42,
    network: 15
  },
  services: [
    { name: 'API Gateway', status: 'online', uptime: '99.9%', lastCheck: '2024-03-20 11:45:00' },
    { name: 'Database', status: 'online', uptime: '99.8%', lastCheck: '2024-03-20 11:45:00' },
    { name: 'File Storage', status: 'online', uptime: '99.7%', lastCheck: '2024-03-20 11:45:00' },
    { name: 'Email Service', status: 'warning', uptime: '98.5%', lastCheck: '2024-03-20 11:44:00' },
    { name: 'Backup Service', status: 'online', uptime: '99.9%', lastCheck: '2024-03-20 11:45:00' },
    { name: 'Cache Redis', status: 'online', uptime: '99.6%', lastCheck: '2024-03-20 11:45:00' }
  ]
}

export async function GET() {
  return NextResponse.json(SYSTEM_INFO)
}