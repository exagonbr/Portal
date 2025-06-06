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
  
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
    
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata uma data para o formato DD/MM/YYYY HH:MM
 * @param date Data para formatar (string ISO, Date ou timestamp)
 * @returns String formatada com data e hora
 */
export const formatDateTime = (date: string | Date | number | undefined): string => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
    
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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