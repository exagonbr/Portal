'use client';

import React, { useState, useEffect } from 'react';
import { useAxiosWithRetry } from '@/hooks/useAxiosWithRetry';
import { Button, Card, Alert, Spin, Progress, Typography, Space } from 'antd';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const { Title, Text, Paragraph } = Typography;

interface RetryableRequestProps<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
  title?: string;
  autoFetch?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  renderSuccess?: (data: T) => React.ReactNode;
  renderError?: (error: any, retry: () => void) => React.ReactNode;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

function RetryableRequest<T = any>({
  url,
  method = 'GET',
  data,
  headers,
  title = 'Carregando dados',
  autoFetch = true,
  maxRetries = 3,
  retryDelay = 1000,
  renderSuccess,
  renderError,
  onSuccess,
  onError
}: RetryableRequestProps<T>) {
  // Estado para controlar se já tentou fazer a requisição inicial
  const [hasFetched, setHasFetched] = useState(false);

  // Usar o hook de retry
  const {
    data: responseData,
    loading,
    error,
    retryCount,
    isRetrying,
    execute,
    retry
  } = useAxiosWithRetry<T>({
    url,
    method,
    data,
    headers,
    retry: {
      maxRetries,
      retryDelay,
      onRetry: (count, err) => {
        console.log(`🔄 Tentativa ${count}/${maxRetries} para ${url}:`, err.message);
      }
    }
  });

  // Efeito para fazer a requisição inicial
  useEffect(() => {
    if (autoFetch && !hasFetched) {
      fetchData();
    }
  }, [autoFetch]);

  // Função para fazer a requisição
  const fetchData = async () => {
    setHasFetched(true);
    try {
      const response = await execute();
      if (response && onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      if (onError) {
        onError(err);
      }
    }
  };

  // Função para tentar novamente
  const handleRetry = () => {
    retry().catch(err => {
      if (onError) {
        onError(err);
      }
    });
  };

  // Renderizar o estado de carregamento
  if (loading && !isRetrying) {
    return (
      <Card className="shadow-sm">
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <Spin size="large" />
          <Text>{title}</Text>
        </div>
      </Card>
    );
  }

  // Renderizar o estado de retry
  if (isRetrying) {
    const progressPercent = (retryCount / maxRetries) * 100;
    
    return (
      <Card className="shadow-sm">
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-5 w-5 text-blue-500" />
            <Text>Tentando novamente ({retryCount}/{maxRetries})...</Text>
          </div>
          
          <Progress percent={progressPercent} status="active" />
          
          <Text type="secondary">
            O servidor está temporariamente indisponível. Tentando reconectar...
          </Text>
        </div>
      </Card>
    );
  }

  // Renderizar o estado de erro
  if (error) {
    // Verificar se é um erro 503
    const is503Error = error.response?.status === 503;
    
    // Renderização personalizada de erro ou padrão
    if (renderError) {
      return renderError(error, handleRetry);
    }
    
    return (
      <Card className="shadow-sm">
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="flex items-center space-x-2">
            {is503Error ? (
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            
            <Title level={4} className="m-0">
              {is503Error ? 'Servidor temporariamente indisponível' : 'Erro ao carregar dados'}
            </Title>
          </div>
          
          <Alert
            type={is503Error ? "warning" : "error"}
            message={is503Error ? "O servidor está temporariamente fora do ar" : "Erro de conexão"}
            description={
              is503Error
                ? "Nossos servidores estão passando por manutenção ou estão sobrecarregados. Por favor, tente novamente em alguns instantes."
                : `Ocorreu um erro ao tentar se comunicar com o servidor: ${error.message}`
            }
            showIcon
          />
          
          <Space>
            <Button 
              type="primary" 
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={handleRetry}
            >
              Tentar novamente
            </Button>
            
            {!autoFetch && (
              <Button onClick={() => window.location.reload()}>
                Recarregar página
              </Button>
            )}
          </Space>
        </div>
      </Card>
    );
  }

  // Renderizar o estado de sucesso
  if (responseData) {
    // Renderização personalizada de sucesso ou padrão
    if (renderSuccess) {
      return renderSuccess(responseData);
    }
    
    return (
      <Card className="shadow-sm">
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <Title level={4} className="m-0">Dados carregados com sucesso</Title>
          </div>
          
          <Paragraph>
            Os dados foram carregados com sucesso do servidor.
          </Paragraph>
          
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60 w-full">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      </Card>
    );
  }

  // Estado inicial (não fez fetch ainda)
  if (!autoFetch && !hasFetched) {
    return (
      <Card className="shadow-sm">
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <Button 
            type="primary" 
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchData}
          >
            Carregar dados
          </Button>
        </div>
      </Card>
    );
  }

  // Fallback (não deveria chegar aqui)
  return null;
}

export default RetryableRequest; 