'use client';

import React, { useState } from 'react';
import { Card, Typography, Divider, Space, Button, Tabs, Alert } from 'antd';
import BackendStatusIndicator from '@/components/ui/BackendStatusIndicator';
import RetryableRequest from '@/components/ui/RetryableRequest';
import { useAxiosWithRetry } from '@/hooks/useAxiosWithRetry';
import { useBackendStatus } from '@/hooks/useBackendStatus';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

export default function MonitoramentoBackendPage() {
  const [activeKey, setActiveKey] = useState('1');
  
  // Usar o hook de status do backend
  const { isOnline, lastChecked, responseTime, error, checkNow } = useBackendStatus({
    interval: 30000, // Verificar a cada 30 segundos
    showToasts: true
  });
  
  // URLs de exemplo para teste
  const apiUrls = {
    working: `${process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api'}/status`,
    unavailable: `${process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api'}/non-existent-endpoint`,
    slow: `${process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api'}/settings?delay=3000`
  };
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="mb-6">
        <Title level={2}>Monitoramento de Conectividade com Backend</Title>
        <Paragraph>
          Esta página demonstra diferentes maneiras de monitorar a conectividade com o backend
          e lidar com erros como o código de status 503 (Serviço Indisponível).
        </Paragraph>
        
        <Alert 
          type="info" 
          message="Sobre o erro 503 (Service Unavailable)" 
          description="O erro 503 ocorre quando o servidor está temporariamente indisponível, geralmente devido à sobrecarga ou manutenção. Os componentes nesta página demonstram como lidar com esse tipo de erro de forma elegante."
          showIcon
          className="mb-4"
        />
      </Card>
      
      <Tabs activeKey={activeKey} onChange={setActiveKey} className="mb-6">
        <TabPane tab="Indicador de Status" key="1">
          <Card>
            <Title level={3}>Indicador de Status do Backend</Title>
            <Paragraph>
              Este componente monitora constantemente a disponibilidade do backend e exibe um indicador visual.
              Clique no indicador para ver mais detalhes.
            </Paragraph>
            
            <div className="flex flex-col items-center space-y-6 my-8">
              <div className="flex space-x-8">
                <div className="text-center">
                  <Text>Indicador Simples</Text>
                  <div className="mt-2">
                    <BackendStatusIndicator position="inline" />
                  </div>
                </div>
                
                <div className="text-center">
                  <Text>Com Rótulo</Text>
                  <div className="mt-2">
                    <BackendStatusIndicator position="inline" showLabel={true} />
                  </div>
                </div>
                
                <div className="text-center">
                  <Text>Com Tempo de Resposta</Text>
                  <div className="mt-2">
                    <BackendStatusIndicator position="inline" showLabel={true} showResponseTime={true} />
                  </div>
                </div>
              </div>
              
              <div className="border p-4 rounded-md bg-gray-50 w-full max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <Text strong>Status atual:</Text>
                  <Text type={isOnline ? "success" : "danger"}>
                    {isOnline ? "Online" : "Offline"}
                  </Text>
                </div>
                
                {responseTime !== null && (
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Tempo de resposta:</Text>
                    <Text>{responseTime}ms</Text>
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-2">
                  <Text strong>Última verificação:</Text>
                  <Text>
                    {lastChecked 
                      ? new Intl.DateTimeFormat('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        }).format(lastChecked)
                      : 'Nunca'}
                  </Text>
                </div>
                
                {error && (
                  <div className="mt-2">
                    <Text strong type="danger">Erro:</Text>
                    <div className="text-xs bg-red-50 p-2 rounded mt-1 text-red-600">
                      {error.message}
                    </div>
                  </div>
                )}
                
                <Button 
                  type="primary" 
                  onClick={() => checkNow()}
                  className="mt-4 w-full"
                >
                  Verificar Agora
                </Button>
              </div>
            </div>
            
            <Paragraph type="secondary">
              O indicador de status pode ser posicionado em qualquer lugar da sua aplicação.
              Por padrão, ele fica fixo no canto inferior direito da tela.
            </Paragraph>
          </Card>
        </TabPane>
        
        <TabPane tab="Requisições com Retry" key="2">
          <Card>
            <Title level={3}>Requisições com Retry Automático</Title>
            <Paragraph>
              Este componente faz requisições com retry automático para erros de servidor (incluindo 503).
              Ele usa backoff exponencial para evitar sobrecarregar o servidor.
            </Paragraph>
            
            <Divider orientation="left">Endpoint Funcionando</Divider>
            <div className="mb-6">
              <RetryableRequest
                url={apiUrls.working}
                title="Carregando status do servidor"
                maxRetries={3}
              />
            </div>
            
            <Divider orientation="left">Endpoint Indisponível (Simulando 503)</Divider>
            <div className="mb-6">
              <RetryableRequest
                url={apiUrls.unavailable}
                title="Tentando acessar endpoint indisponível"
                maxRetries={3}
              />
            </div>
            
            <Divider orientation="left">Endpoint Lento</Divider>
            <div className="mb-6">
              <RetryableRequest
                url={apiUrls.slow}
                title="Carregando dados de configuração"
                maxRetries={2}
              />
            </div>
          </Card>
        </TabPane>
        
        <TabPane tab="Implementação Manual" key="3">
          <Card>
            <Title level={3}>Uso Manual do Hook useAxiosWithRetry</Title>
            <Paragraph>
              Este exemplo mostra como usar o hook useAxiosWithRetry diretamente em seus componentes,
              para casos em que você precisa de mais controle sobre o processo de retry.
            </Paragraph>
            
            <ManualRetryExample />
          </Card>
        </TabPane>
      </Tabs>
      
      {/* Indicador de status fixo no canto da tela */}
      <BackendStatusIndicator position="bottom-right" />
    </div>
  );
}

// Componente de exemplo para demonstrar o uso manual do hook
function ManualRetryExample() {
  // Usar o hook de retry
  const {
    data,
    loading,
    error,
    retryCount,
    isRetrying,
    execute,
    retry
  } = useAxiosWithRetry({
    url: `${process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api'}/status`,
    method: 'GET',
    retry: {
      maxRetries: 3,
      retryDelay: 2000,
      retryStatusCodes: [500, 502, 503, 504]
    }
  });
  
  return (
    <div className="border rounded-md p-4 bg-gray-50">
      <div className="mb-4">
        <Text strong>Estado atual:</Text>
        <div className="mt-2">
          {loading && <Text>Carregando...</Text>}
          {isRetrying && <Text type="warning">Tentando novamente ({retryCount}/3)...</Text>}
          {error && <Text type="danger">Erro: {error.message}</Text>}
          {data && <Text type="success">Dados carregados com sucesso!</Text>}
        </div>
      </div>
      
      <Space>
        <Button 
          type="primary" 
          onClick={() => execute()}
          loading={loading || isRetrying}
          disabled={loading || isRetrying}
        >
          Fazer Requisição
        </Button>
        
        <Button 
          onClick={() => retry()}
          disabled={!error || loading || isRetrying}
        >
          Tentar Novamente
        </Button>
      </Space>
      
      {data && (
        <div className="mt-4">
          <Text strong>Dados recebidos:</Text>
          <pre className="bg-white p-2 rounded-md overflow-auto max-h-60 mt-2">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 