'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastManager';
import EmailTemplateManager from '@/components/notifications/EmailTemplateManager';

interface EmailTemplate {
  id: string | number;
  name: string;
  subject: string;
  message: string;
  html?: string;
  category?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export default function TemplatesPage() {
  const { showSuccess, showError } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar templates ao iniciar a página
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/templates');
      if (!response.ok) {
        throw new Error('Erro ao carregar templates');
      }
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      showError('Não foi possível carregar os templates. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    try {
      const isNew = typeof template.id === 'string' && template.id.startsWith('new_');
      const url = isNew 
        ? '/api/notifications/templates' 
        : `/api/notifications/templates/${template.id}`;
      
      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar template');
      }

      const savedTemplate = await response.json();
      
      // Atualizar a lista de templates
      setTemplates(prev => {
        if (isNew) {
          return [...prev, savedTemplate.template];
        } else {
          return prev.map(t => t.id === template.id ? savedTemplate.template : t);
        }
      });

      showSuccess('Template salvo com sucesso!');
      return savedTemplate;
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      showError('Erro ao salvar template. Tente novamente.');
      throw error;
    }
  };

  const handleDeleteTemplate = async (id: string | number) => {
    try {
      // Se for um template novo que ainda não foi salvo no servidor
      if (typeof id === 'string' && id.startsWith('new_')) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        return;
      }
      
      const response = await fetch(`/api/notifications/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir template');
      }

      // Remover da lista
      setTemplates(prev => prev.filter(t => t.id !== id));
      showSuccess('Template excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      showError('Erro ao excluir template. Tente novamente.');
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates de Email</h1>
        <p className="text-gray-600">
          Gerencie os templates de email para envio de notificações
        </p>
      </div>

      <EmailTemplateManager
        templates={templates}
        loading={loading}
        onSave={handleSaveTemplate}
        onDelete={handleDeleteTemplate}
      />
    </div>
  );
} 