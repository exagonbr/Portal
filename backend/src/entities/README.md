# Entidades do Sistema Portal

Este diretório contém todas as entidades TypeORM mapeadas a partir do banco de dados MySQL existente.

## Entidades Criadas/Atualizadas

### Entidades Base
- **Author** - Autores de conteúdo
- **CookieSigned** - Cookies assinados para autenticação
- **EducationPeriod** - Períodos educacionais
- **EducationalStage** - Estágios educacionais (séries)
- **File** - Arquivos do sistema
- **Genre** - Gêneros de conteúdo
- **Institution** - Instituições de ensino
- **Language** - Idiomas disponíveis
- **MediaEntry** - Entradas de mídia (livros, vídeos, etc.)
- **MediaFile** - Relação entre mídia e arquivos
- **Publisher** - Editoras
- **Role** - Papéis/funções de usuário
- **Subject** - Disciplinas
- **TeacherSubject** - Disciplinas dos professores
- **User** - Usuários do sistema
- **UserRole** - Relação muitos-para-muitos entre usuários e papéis

### Entidades Existentes (a serem atualizadas)
- Book
- ChatMessage
- Course
- ForumReply
- ForumThread
- Notification
- SchoolManager
- UserClass

## Estrutura da Tabela User

A entidade User foi mapeada conforme a estrutura MySQL fornecida:

```sql
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `version` bigint DEFAULT NULL,
  `account_expired` bit(1) DEFAULT NULL,
  `account_locked` bit(1) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `amount_of_media_entries` int DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `enabled` bit(1) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `invitation_sent` bit(1) DEFAULT NULL,
  `is_admin` bit(1) NOT NULL,
  `language` varchar(255) DEFAULT NULL,
  `last_updated` datetime DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `password_expired` bit(1) DEFAULT NULL,
  `pause_video_on_click` bit(1) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `reset_password` bit(1) NOT NULL DEFAULT b'1',
  `username` varchar(255) DEFAULT NULL,
  `uuid` varchar(255) DEFAULT NULL,
  `is_manager` bit(1) NOT NULL,
  `type` int DEFAULT NULL,
  `certificate_path` varchar(255) DEFAULT NULL,
  `is_certified` bit(1) DEFAULT b'0',
  `is_student` bit(1) NOT NULL,
  `is_teacher` bit(1) NOT NULL,
  `institution_id` bigint DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `subject_data_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_sb8bbouer5wak8vyiiy4pf2bx` (`username`),
  KEY `FKjbkkfl7f3ffm66dmg5aw4yfv3` (`institution_id`),
  KEY `FKhfr500wywt00410o71iotd6nn` (`subject_data_id`),
  CONSTRAINT `FKhfr500wywt00410o71iotd6nn` FOREIGN KEY (`subject_data_id`) REFERENCES `teacher_subject` (`id`),
  CONSTRAINT `FKjbkkfl7f3ffm66dmg5aw4yfv3` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7709 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## Configuração TypeORM

O arquivo `src/config/typeorm.config.ts` foi atualizado para incluir todas as novas entidades.

## Próximos Passos

1. Atualizar as entidades existentes (Book, ChatMessage, etc.) para corresponder às estruturas das tabelas MySQL
2. Criar migrações para sincronizar o banco de dados
3. Atualizar os repositórios e serviços para usar as novas entidades
4. Testar todas as funcionalidades afetadas pelas mudanças

## Observações

- Todas as entidades usam `PrimaryGeneratedColumn('increment')` para corresponder ao `AUTO_INCREMENT` do MySQL
- Campos booleanos são mapeados como `boolean` no TypeORM (bit(1) no MySQL)
- Relacionamentos foram mantidos conforme as foreign keys existentes
- A entidade User mantém compatibilidade com o código existente através de aliases e getters/setters