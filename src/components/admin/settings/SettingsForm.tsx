'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { settingsService, SettingDto, UpdateSettingsDto } from '@/services/settingsService';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

export const SettingsForm: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<UpdateSettingsDto>();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingDto[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const fetchedSettings = await settingsService.getSettings({});
        setSettings(fetchedSettings);
        
        // Preencher o formulário com os valores buscados
        const defaultValues = fetchedSettings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as UpdateSettingsDto);
        reset(defaultValues);

      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: UpdateSettingsDto) => {
    setLoading(true);
    try {
      await settingsService.updateSettings(data);
      // Add success notification
    } catch (error) {
      console.error("Failed to update settings", error);
      // Add error notification
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {settings.map((setting) => (
        <div key={setting.id}>
          <Label htmlFor={setting.key}>{setting.name}</Label>
          <Input
            id={setting.key}
            type={setting.type === 'number' ? 'number' : 'text'}
            {...register(setting.key)}
          />
          {setting.description && <p className="text-sm text-gray-500 mt-1">{setting.description}</p>}
        </div>
      ))}
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </form>
  );
};