const fetch = require('node-fetch');

// Configuração
const API_URL = 'http://localhost:3000';
const endpoints = [
  '/api/dashboard/system',
  '/api/dashboard/analytics',
  '/api/dashboard/engagement',
  '/api/aws/connection-logs/stats',
  '/api/users/stats'
];

// Token de teste (substitua com um token válido)
