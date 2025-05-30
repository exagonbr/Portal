# Integração AWS - Portal Educacional

## Visão Geral

Este documento descreve a implementação da integração com AWS para monitoramento de performance e analytics do sistema. As páginas de **Performance** e **Analytics** agora obtêm dados da AWS usando configurações parametrizadas definidas na página de **Settings**.

## Funcionalidades Implementadas

### 1. Configurações da AWS (`/admin/settings`)

#### Credenciais e Configuração
- **Access Key ID**: Chave de acesso da AWS
- **Secret Access Key**: Chave secreta da AWS  
- **Região**: Região AWS onde os recursos estão localizados
- **CloudWatch Namespace**: Namespace para métricas personalizadas
- **Intervalo de Atualização**: Tempo em segundos para atualização automática dos dados
- **Atualizações em Tempo Real**: Toggle para ativar/desativar atualizações automáticas

#### Configurações do S3
- **Nome do Bucket S3**: Bucket para armazenamento de arquivos
- **Classe de Armazenamento**: Standard, Reduced Redundancy, Standard-IA, Glacier
- **Criptografia**: AES-256, AWS KMS, ou nenhuma
- **Listagem de Buckets**: Botão para carregar buckets disponíveis da conta AWS

#### Funcionalidades de Teste
- **Teste de Conexão**: Valida credenciais e conectividade com AWS
- **Visualização de Buckets**: Lista buckets S3 disponíveis
- **Status em Tempo Real**: Mostra status da conexão, região ativa, e configurações

### 2. Página de Performance (`/admin/performance`)

#### Métricas do CloudWatch
- **CPU Usage**: Uso de CPU do sistema
- **Memory Usage**: Uso de memória
- **Disk Usage**: Uso de disco
- **Network I/O**: Tráfego de rede

#### Funcionalidades
- **Atualização Automática**: Baseada no intervalo configurado nas settings
- **Atualização Manual**: Botão para forçar atualização imediata
- **Status Visual**: Indicadores de status (Normal, Atenção, Crítico)
- **Timestamps**: Horário da última atualização de cada métrica
- **Status da Conexão AWS**: Painel com informações da configuração ativa

#### Estados da Interface
- **Loading State**: Skeleton loading durante carregamento
- **Configuração Necessária**: Aviso quando AWS não está configurada
- **Error Handling**: Tratamento de erros com mensagens específicas

### 3. Página de Analytics (`/admin/analytics`)

#### Métricas do Sistema
- **Usuários Online**: Número de usuários ativos
- **Aulas em Andamento**: Sessões de aula ativas
- **Carga do Sistema**: Percentual de carga do sistema
- **Tempo de Resposta**: Latência média do sistema

#### Analytics do S3
- **Tamanho Total**: Espaço utilizado no bucket
- **Número de Arquivos**: Contagem de objetos armazenados
- **Custo Mensal**: Estimativa de custo baseada no uso
- **Última Modificação**: Data da última alteração

#### Métricas de Performance Avançadas
- **CPU, Memória, Disco, Rede**: Barras de progresso com códigos de cor
- **Trends**: Indicadores de tendência comparados com baseline
- **Thresholds**: Limites configuráveis para alertas visuais

## Arquitetura

### Hook Personalizado: `useAwsSettings`
```typescript
interface AwsSettings {
  accessKeyId: string
  secretAccessKey: string
  region: string
  s3BucketName: string
  cloudWatchNamespace: string
  updateInterval: number
  enableRealTimeUpdates: boolean
}
```

### Serviço AWS: `awsService`
- **Simulação de API**: Dados simulados para desenvolvimento
- **Métodos Principais**:
  - `getPerformanceMetrics()`: Métricas do CloudWatch
  - `getSystemAnalytics()`: Analytics do sistema
  - `getS3StorageInfo()`: Informações do S3
  - `testConnection()`: Teste de conectividade
  - `listS3Buckets()`: Lista de buckets disponíveis

### Persistência
- **LocalStorage**: Configurações salvas automaticamente
- **Sync Cross-Pages**: Configurações compartilhadas entre páginas
- **Auto-reload**: Configurações carregadas automaticamente no refresh

## Como Usar

### 1. Configurar AWS
1. Acesse `/admin/settings`
2. Preencha as credenciais da AWS
3. Selecione a região desejada
4. Configure o intervalo de atualização (10-300 segundos)
5. Teste a conexão com o botão "Testar Conexão"
6. Configure o bucket S3 (opcional)
7. Salve as configurações

### 2. Monitorar Performance
1. Acesse `/admin/performance`
2. Visualize métricas em tempo real do CloudWatch
3. Use o botão "Atualizar" para refresh manual
4. Monitore status de cada métrica (Normal/Atenção/Crítico)

### 3. Analisar Sistema
1. Acesse `/admin/analytics`
2. Visualize analytics gerais do sistema
3. Monitore uso do S3 (se configurado)
4. Acompanhe trends e comparações com baseline

## Códigos de Status

### Performance Metrics
- 🟢 **Normal**: Valores dentro dos parâmetros normais
- 🟡 **Atenção**: Valores próximos aos limites
- 🔴 **Crítico**: Valores acima dos limites recomendados

### Conexão AWS
- ✅ **Conectado**: Credenciais válidas e conexão estabelecida
- ⚠️ **Não testado**: Configuração não testada ainda
- ❌ **Erro**: Falha na autenticação ou conectividade

## Limitações Atuais

1. **Dados Simulados**: Por ser ambiente de desenvolvimento, os dados são simulados
2. **Gráficos**: Placeholders para futura implementação
3. **Autenticação Real**: Integração real com AWS requer configuração de produção
4. **Rate Limiting**: Sem controle de taxa de requisições implementado

## Próximos Passos

1. **Integração Real com AWS SDK**: Substituir simulação por calls reais
2. **Implementação de Gráficos**: Charts.js ou similar para visualizações
3. **Alertas Automáticos**: Sistema de notificações baseado em thresholds
4. **Dashboard Customizável**: Widgets movíveis e configuráveis
5. **Exportação de Dados**: CSV, PDF, Excel
6. **Histórico de Métricas**: Armazenamento e consulta de dados históricos

## Estrutura de Arquivos

```
src/
├── hooks/
│   └── useAwsSettings.ts          # Hook para gerenciar configurações AWS
├── services/
│   └── awsService.ts              # Serviço de integração com AWS
├── app/admin/
│   ├── settings/page.tsx          # Página de configurações
│   ├── performance/page.tsx       # Página de performance
│   └── analytics/page.tsx         # Página de analytics
└── README-AWS-Integration.md      # Esta documentação
```

## Tecnologias Utilizadas

- **React 18**: Hooks e componentes funcionais
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Local Storage**: Persistência de configurações
- **AWS SDK** (simulado): Integração com serviços AWS 