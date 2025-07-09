import { Request } from 'express';
// @ts-ignore
import UAParser from 'ua-parser-js';
// @ts-ignore
import geoip from 'geoip-lite';

export interface ClientInfo {
  ip: string;
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: string;
  location?: string;
  country?: string;
  region?: string;
  city?: string;
}

/**
 * Extrai o IP real do cliente considerando proxies e load balancers
 */
function getRealIP(req: Request): string {
  // Verificar se req é um objeto válido
  if (!req) {
    return 'unknown';
  }
  
  // Verificar headers de proxy na ordem de prioridade
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for pode conter múltiplos IPs separados por vírgula
    const ips = String(forwardedFor).split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  // Outros headers comuns de proxy
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return String(realIP);
  }
  
  // CloudFlare
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  if (cfConnectingIP) {
    return String(cfConnectingIP);
  }
  
  // Nginx
  const nginxRealIP = req.headers['x-nginx-proxy'];
  if (nginxRealIP) {
    return String(nginxRealIP);
  }
  
  // IP direto da conexão
  return req.ip || (req.socket?.remoteAddress || 'unknown');
}

/**
 * Extrai informações detalhadas do cliente a partir do Request
 */
export function getClientInfo(req: Request): ClientInfo {
  const ip = getRealIP(req);
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Parser do User Agent - usando asserção de tipo
  const parser = new (UAParser as any)(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();
  
  // Informações de localização baseadas no IP
  let location: string | undefined;
  let country: string | undefined;
  let region: string | undefined;
  let city: string | undefined;
  
  if (ip && ip !== 'unknown') {
    const geo = (geoip as any).lookup(ip);
    if (geo) {
      country = geo.country;
      region = geo.region;
      city = geo.city;
      location = [city, region, country].filter(Boolean).join(', ');
    }
  }
  
  // Determinar tipo de dispositivo
  let deviceType = 'desktop';
  if (device.type) {
    deviceType = device.type;
  } else if (/mobile/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/tablet/i.test(userAgent)) {
    deviceType = 'tablet';
  }
  
  return {
    ip,
    userAgent,
    browser: browser.name || 'unknown',
    browserVersion: browser.version || 'unknown',
    os: os.name || 'unknown',
    osVersion: os.version || 'unknown',
    device: device.model || deviceType,
    deviceType,
    location,
    country,
    region,
    city
  };
}

/**
 * Formata informações do cliente para log
 */
export function formatClientInfo(clientInfo: ClientInfo): string {
  const parts = [
    `IP: ${clientInfo.ip}`,
    `Browser: ${clientInfo.browser} ${clientInfo.browserVersion}`,
    `OS: ${clientInfo.os} ${clientInfo.osVersion}`,
    `Device: ${clientInfo.device}`
  ];
  
  if (clientInfo.location) {
    parts.push(`Location: ${clientInfo.location}`);
  }
  
  return parts.join(' | ');
}

/**
 * Verifica se o cliente é um bot
 */
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /slackbot/i,
    /discord/i,
    /telegram/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Extrai informações simplificadas do dispositivo
 */
export function getDeviceInfo(req: Request): {
  type: string;
  name: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isBot: boolean;
} {
  const userAgent = req.headers['user-agent'] || '';
  const parser = new (UAParser as any)(userAgent);
  const device = parser.getDevice();
  
  const isMobile = /mobile/i.test(userAgent) || device.type === 'mobile';
  const isTablet = /tablet/i.test(userAgent) || device.type === 'tablet';
  const isDesktop = !isMobile && !isTablet && !isBot(userAgent);
  
  return {
    type: device.type || (isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'),
    name: device.model || 'unknown',
    isMobile,
    isTablet,
    isDesktop,
    isBot: isBot(userAgent)
  };
} 