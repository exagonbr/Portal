import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AuthorDto } from '@/types/author';

interface AuthorFormProps {
  author?: AuthorDto | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function AuthorForm({ author, mode, onSubmit, onCancel }: AuthorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    is_active: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Carregar dados do autor se estiver em modo de edição ou visualização
  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name || '',
        bio: author.bio || '',
        is_active: author.is_active !== undefined ? author.is_active : true
      });
    }
  }, [author]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Limpar erro do campo quando o usuário digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onCancel();
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };
  
  const isReadOnly = mode === 'view';
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isReadOnly}
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isReadOnly ? 'bg-gray-100' : ''
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Biografia
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={formData.bio}
          onChange={handleChange}
          disabled={isReadOnly}
          className={`w-full px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isReadOnly ? 'bg-gray-100' : ''
          }`}
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          disabled={isReadOnly}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
          Ativo
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          {mode === 'view' ? 'Fechar' : 'Cancelar'}
        </Button>
        
        {mode !== 'view' && (
          <Button type="submit">
            {mode === 'create' ? 'Criar' : 'Atualizar'}
          </Button>
        )}
      </div>
    </form>
  );
} 