// src/hooks/useAwsSettings.ts

import { useState, useMemo } from 'react';

export interface AwsSettings {
  region: string;
  // Outras configurações da AWS podem ser adicionadas aqui
  // Por exemplo: outputFormat: 'json' | 'table' | 'text';
}

const AVAILABLE_REGIONS = [
  { id: 'us-east-1', name: 'N. Virginia (us-east-1)' },
  { id: 'us-east-2', name: 'Ohio (us-east-2)' },
  { id: 'us-west-1', name: 'N. California (us-west-1)' },
  { id: 'us-west-2', name: 'Oregon (us-west-2)' },
  { id: 'sa-east-1', name: 'São Paulo (sa-east-1)' },
  // Adicione outras regiões conforme necessário
];

const useAwsSettings = (defaultSettings?: Partial<AwsSettings>) => {
  const [settings, setSettings] = useState<AwsSettings>({
    region: defaultSettings?.region || 'sa-east-1',
    ...defaultSettings,
  });

  const setRegion = (newRegion: string) => {
    if (AVAILABLE_REGIONS.some(r => r.id === newRegion)) {
      setSettings(prev => ({ ...prev, region: newRegion }));
    } else {
      console.warn(`Região da AWS inválida: ${newRegion}`);
    }
  };

  const availableRegions = useMemo(() => AVAILABLE_REGIONS, []);

  return {
    settings,
    setSettings,
    setRegion,
    availableRegions,
  };
};

export { useAwsSettings };