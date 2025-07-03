#!/usr/bin/env tsx

/**
 * Script TypeScript para mapear e testar todas as rotas de API
 * Versão integrada com Next.js
 * Autor: Kilo Code
 * Data: 2025-01-07
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Tipos
interface RouteInfo {
  path: string;
  file: string;
  methods: string[];
  hasAuth: boolean;
  description: string;
  params?: string[];
}

interface TestResult {
  method: string;
  status: number;
  success: boolean;
  message: string;
  hasData: boolean;
  responseTime: number;
  error?: string;
}

interface AuthResult {
  token?: string;
  refreshToken?: string;
  user?: any;
  success: boolean;
}

interface ApiTestReport {
  timestamp: string;
  baseUrl: string;
  totalRoutes: number;
  authSuccess: boolean;
  routes: RouteTestResult[];
  summary: {
    total: number;
    success: number;
    failed: number;
    authRequired: number;
    byStatus: Record<number, number>;
  };
}

interface RouteTestResult extends RouteInfo {
  tests: TestResult[];
}

// Configurações
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  credentials: {
    email: 'admin@sabercon.edu.br',
    password: 'password123'
  },
  timeout: 15000,
  maxRetries: 3,
  delay: 100, // delay entre requests em ms
};

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// Função para log colorido
function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para fazer requisições HTTP com fetch
async function makeRequest(url: string, options: RequestInit = {}): Promise<{
  status: number;
  headers: Headers;
  data: any;
  raw: string;
  parseError?: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Route-Mapper-TS/1.0',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    const raw = await response.text();
    let data: any = null;
    let parseError: string | undefined;

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (error) {
      parseError = error instanceof Error ? error.message : 'Parse error';
    }

    return {
      status: response.status,
      headers: response.headers,
      data,
      raw,
      parseError,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Função para descobrir rotas recursivamente
function discoverRoutes(dir: string, basePath: string = ''): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const routePath = path.join(basePath, item.name);
      
      if (item.isDirectory()) {
        // Verificar se é um diretório de rota dinâmica
        if (item.name.startsWith('[') && item.name.endsWith(']')) {
