/**
 * Funções utilitárias para formatação de datas
 */

/**
 * Formata uma data para o formato DD/MM/YYYY
 * @param date Data para formatar (string ISO, Date ou timestamp)
 * @returns String formatada no padrão brasileiro
 */
export const formatDate = (date: string | Date | number | undefined): string => {
  if (!date) return '-';
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Se a string não tem informação de horário, adiciona T00:00:00 para evitar problemas de fuso horário
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateObj = new Date(date + 'T00:00:00');
    } else {
      dateObj = new Date(date);
    }
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
    
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
};

/**
 * Formata uma data para o formato DD/MM/YYYY HH:MM
 * @param date Data para formatar (string ISO, Date ou timestamp)
 * @returns String formatada com data e hora
 */
export const formatDateTime = (date: string | Date | number | undefined): string => {
  if (!date) return '-';
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Se a string não tem informação de horário, adiciona T00:00:00 para evitar problemas de fuso horário
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateObj = new Date(date + 'T00:00:00');
    } else {
      dateObj = new Date(date);
    }
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
    
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

/**
 * Formata apenas o ano de uma data
 * @param date Data para formatar (string ISO, Date ou timestamp)
 * @returns String com o ano formatado
 */
export const formatYear = (date: string | Date | number | undefined): string => {
  if (!date) return '-';
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Se a string não tem informação de horário, adiciona T00:00:00 para evitar problemas de fuso horário
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateObj = new Date(date + 'T00:00:00');
    } else {
      dateObj = new Date(date);
    }
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
    
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('pt-BR', {
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
};

/**
 * Formata o tempo em segundos para o formato MM:SS ou HH:MM:SS
 */
export function formatVideoTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formata a duração de um vídeo para exibição
 */
export function formatVideoDuration(duration: string | number | undefined): string {
  if (!duration) {
    return '--:--';
  }
  
  // Se for uma string no formato "HH:MM:SS"
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }
  
  // Se for um número em segundos
  if (typeof duration === 'number' || !isNaN(Number(duration))) {
    return formatVideoTime(Number(duration));
  }
  
  return '--:--';
}

/**
 * Formata a diferença entre uma data e agora em formato relativo
 * @param date Data para calcular a diferença
 * @returns String no formato "há X dias/horas/etc"
 */
export const formatRelativeTime = (date: string | Date | number | undefined): string => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
    
  if (isNaN(dateObj.getTime())) return '-';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);
  
  if (diffSec < 60) return 'Agora mesmo';
  if (diffMin < 60) return `Há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  if (diffHour < 24) return `Há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
  if (diffDay < 30) return `Há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`;
  if (diffMonth < 12) return `Há ${diffMonth} ${diffMonth === 1 ? 'mês' : 'meses'}`;
  return `Há ${diffYear} ${diffYear === 1 ? 'ano' : 'anos'}`;
}; 