# Configuração do Servidor - Portal Sabercon Backend

## 📋 Visão Geral

Este diretório contém os arquivos de configuração essenciais para o funcionamento do backend do Portal Sabercon. Após uma refatoração focada em simplificação, a estrutura foi consolidada para melhorar a clareza e a manutenibilidade.

## 🏗️ Estrutura Simplificada

A abordagem atual centraliza as configurações em um número menor de arquivos, cada um com uma responsabilidade clara:

- **`env.ts`**: Gerencia e valida as variáveis de ambiente da aplicação.
- **`errorHandling.ts`**: Configura o middleware de tratamento de erros centralizado.
- **`jwt.ts`**: Define as configurações para a geração e validação de JSON Web Tokens.
- **`middlewares.ts`**: Orquestra a configuração de todos os middlewares do Express (CORS, Helmet, etc.).
- **`passport.ts`**: Configura as estratégias de autenticação do Passport.js.
- **`redis.ts`**: Gerencia a conexão com o servidor Redis.
- **`routes.ts`**: Define e organiza todas as rotas da aplicação.
- **`serverInitializer.ts`**: Controla o processo de inicialização do servidor, incluindo conexões de banco de dados.
- **`typeorm.config.ts`**: Contém a configuração de conexão do TypeORM com o banco de dados.

## 🎯 Benefícios da Simplificação

- **Clareza**: É mais fácil entender onde cada configuração reside.
- **Manutenção Reduzida**: Menos arquivos e menos complexidade significam menos esforço para manter.
- **Coesão**: Configurações relacionadas estão agrupadas de forma mais lógica.