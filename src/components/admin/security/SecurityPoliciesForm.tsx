'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { securityPoliciesService, SecurityPolicy } from '@/services/securityPoliciesService';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/Switch';

export const SecurityPoliciesForm: React.FC = () => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SecurityPolicy>();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const policies = await securityPoliciesService.getAll();
        if (policies.length > 0) {
          setPolicy(policies[0]);
          reset(policies[0]);
        }
      } catch (error) {
        console.error("Failed to fetch security policy", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [reset]);

  const onSubmit = async (data: SecurityPolicy) => {
    if (!policy) return;
    setLoading(true);
    try {
      await securityPoliciesService.update(policy.id, data);
      // Add success notification
    } catch (error) {
      console.error("Failed to update security policy", error);
      // Add error notification
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando políticas de segurança...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Password Policies */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Políticas de Senha</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="passwordMinLength">Tamanho Mínimo da Senha</Label>
            <Controller
              name="passwordMinLength"
              control={control}
              render={({ field }) => <Input id="passwordMinLength" type="number" {...field} />}
            />
          </div>
          <div>
            <Label htmlFor="passwordExpiryDays">Dias para Expiração da Senha</Label>
            <Controller
              name="passwordExpiryDays"
              control={control}
              render={({ field }) => <Input id="passwordExpiryDays" type="number" {...field} />}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="passwordRequireUppercase"
              control={control}
              render={({ field }) => <Switch id="passwordRequireUppercase" checked={field.value} onChange={field.onChange} />}
            />
            <Label htmlFor="passwordRequireUppercase">Exigir Maiúsculas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="passwordRequireLowercase"
              control={control}
              render={({ field }) => <Switch id="passwordRequireLowercase" checked={field.value} onChange={field.onChange} />}
            />
            <Label htmlFor="passwordRequireLowercase">Exigir Minúsculas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="passwordRequireNumbers"
              control={control}
              render={({ field }) => <Switch id="passwordRequireNumbers" checked={field.value} onChange={field.onChange} />}
            />
            <Label htmlFor="passwordRequireNumbers">Exigir Números</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="passwordRequireSpecialChars"
              control={control}
              render={({ field }) => <Switch id="passwordRequireSpecialChars" checked={field.value} onChange={field.onChange} />}
            />
            <Label htmlFor="passwordRequireSpecialChars">Exigir Caracteres Especiais</Label>
          </div>
        </div>
      </div>

      {/* Account Policies */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Políticas de Conta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="accountMaxLoginAttempts">Tentativas Máximas de Login</Label>
                <Controller
                  name="accountMaxLoginAttempts"
                  control={control}
                  render={({ field }) => <Input id="accountMaxLoginAttempts" type="number" {...field} />}
                />
            </div>
            <div>
                <Label htmlFor="accountLockoutDurationMinutes">Duração do Bloqueio (minutos)</Label>
                <Controller
                  name="accountLockoutDurationMinutes"
                  control={control}
                  render={({ field }) => <Input id="accountLockoutDurationMinutes" type="number" {...field} />}
                />
            </div>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Políticas'}
      </Button>
    </form>
  );
};