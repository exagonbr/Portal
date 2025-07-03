/**
 * Utilitário para mapear dados entre formatos legados e novos
 */
export class LegacyMapper {
  /**
   * Mapeia dados de um formato para outro
   */
  static mapData(data: any, mapping: Record<string, string>): any {
    if (!data) return null;
    
    const result: Record<string, any> = {};
    
    Object.entries(mapping).forEach(([targetKey, sourceKey]) => {
      if (typeof sourceKey === 'string' && sourceKey in data) {
        result[targetKey] = data[sourceKey];
      }
    });
    
    return result;
  }
  
  /**
   * Converte dados para formato JSON
   */
  static parseJSON(data: any): any {
    if (!data) return null;
    
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    
    return data;
  }
} 