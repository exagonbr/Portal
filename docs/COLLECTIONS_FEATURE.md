# Funcionalidade de Coleções de Vídeos

## Visão Geral

A funcionalidade de Coleções de Vídeos foi implementada para integrar os dados legados da tabela `tv_show` do MySQL com uma interface moderna no Portal de Vídeos. Esta funcionalidade permite aos usuários navegar, pesquisar e visualizar coleções de conteúdo educacional organizadas por temas.

## Arquitetura

### Backend

#### Entidades
- **TVShow** (`backend/src/entities/TVShow.ts`): Entidade TypeORM que mapeia a tabela `tv_show` do MySQL legado
- **TVShowService** (`backend/src/services/TVShowService.ts`): Serviço para operações de banco de dados
- **TVShowController** (`backend/src/controllers/TVShowController.ts`): Controller para endpoints da API

#### API Endpoints

```
GET /api/collections                    # Busca todas as coleções
GET /api/collections/search?q=termo     # Pesquisa coleções por termo
GET /api/collections/popular?limit=10   # Busca coleções populares
GET /api/collections/top-rated?limit=10 # Busca coleções mais bem avaliadas
GET /api/collections/recent?limit=10    # Busca coleções recentes
GET /api/collections/:id                # Busca coleção específica por ID
```

#### Estrutura da Tabela tv_show

A tabela `tv_show` do MySQL contém os seguintes campos principais:
- `id`: Identificador único
- `name`: Nome da coleção
- `overview`: Descrição/sinopse
- `poster_path`: Caminho para imagem de poster
- `backdrop_path`: Caminho para imagem de fundo
- `first_air_date`: Data de lançamento
- `popularity`: Índice de popularidade
- `vote_average`: Média de avaliações
- `vote_count`: Número de avaliações
- `producer`: Produtor do conteúdo
- `total_load`: Carga horária total

### Frontend

#### Componentes
- **CollectionsPage** (`src/app/portal/collections/page.tsx`): Página principal de coleções
- **CollectionCard** (`src/components/collections/CollectionCard.tsx`): Componente de card reutilizável
- **useCollections** (`src/hooks/useCollections.ts`): Hook personalizado para gerenciar estado

#### Tipos TypeScript
- **TVShowCollection** (`src/types/collections.ts`): Interface principal para coleções
- **CollectionsApiResponse**: Interface para respostas da API

#### Estilos
- **collections.css** (`src/styles/collections.css`): Estilos específicos para coleções

## Funcionalidades

### 1. Visualização de Coleções
- Grid responsivo de cards de coleções
- Seções organizadas: Populares, Mais Bem Avaliadas, Recentes, Todas
- Modal de detalhes ao clicar em uma coleção

### 2. Pesquisa
- Campo de pesquisa em tempo real
- Busca por nome, descrição e produtor
- Resultados filtrados dinamicamente

### 3. Avaliações
- Sistema de estrelas (1-5) baseado na avaliação original (1-10)
- Exibição do número de avaliações
- Indicador de popularidade

### 4. Responsividade
- Layout adaptativo para desktop, tablet e mobile
- Cards redimensionáveis
- Interface otimizada para touch

## Navegação

A funcionalidade foi adicionada aos menus de navegação:
- **DashboardSidebar**: Seção "Portais" → "Coleções de Vídeos"
- **StandardSidebar**: Disponível para todos os tipos de usuário
- Ícone: `video_library`
- Permissão: `canAccessLearningMaterials` ou `canUploadResources`

## Configuração

### Dependências
- `mysql2`: Para conexão com banco MySQL legado
- `@heroicons/react`: Para ícones da interface

### Variáveis de Ambiente
```env
MYSQL_HOST=sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=sabercon
MYSQL_PASSWORD=gWg28m8^vffI9X#
MYSQL_DATABASE=sabercon
```

## Melhorias Futuras

1. **Cache**: Implementar cache Redis para melhorar performance
2. **Paginação**: Adicionar paginação para grandes volumes de dados
3. **Filtros Avançados**: Filtros por data, avaliação, produtor
4. **Favoritos**: Sistema de coleções favoritas por usuário
5. **Player Integrado**: Integração direta com player de vídeo
6. **Analytics**: Tracking de visualizações e engajamento
7. **Recomendações**: Sistema de recomendações baseado em preferências

## Testes

Para testar a funcionalidade:

1. Acesse `/portal/collections`
2. Verifique se as coleções carregam corretamente
3. Teste a funcionalidade de pesquisa
4. Clique em uma coleção para ver os detalhes
5. Verifique a responsividade em diferentes dispositivos

## Troubleshooting

### Erro de Conexão MySQL
- Verifique as variáveis de ambiente
- Confirme conectividade com o banco legado
- Verifique se a tabela `tv_show` existe

### Imagens não carregam
- Verifique se o diretório `/public/collections/` existe
- Implemente fallback para imagens ausentes
- Configure CDN se necessário

### Performance lenta
- Implemente cache
- Otimize queries SQL
- Adicione índices na tabela `tv_show` 