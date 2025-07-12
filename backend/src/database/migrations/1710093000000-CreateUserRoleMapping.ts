import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateUserRoleMapping1710093000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar a tabela de mapeamento user_role_mappings
        await queryRunner.createTable(new Table({
            name: "user_role_mappings",
            columns: [
                {
                    name: "id",
                    type: "bigint",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "user_id",
                    type: "bigint",
                    isNullable: false
                },
                {
                    name: "role_id",
                    type: "bigint",
                    isNullable: false
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Adicionar chaves estrangeiras
        await queryRunner.createForeignKey("user_role_mappings", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("user_role_mappings", new TableForeignKey({
            columnNames: ["role_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "roles",
            onDelete: "CASCADE"
        }));

        // Migrar dados existentes
        await queryRunner.query(`
            INSERT INTO user_role_mappings (user_id, role_id)
            SELECT id, role_id FROM users WHERE role_id IS NOT NULL;
        `);

        // Remover a coluna role_id da tabela users
        await queryRunner.query(`
            ALTER TABLE users DROP COLUMN IF EXISTS role_id;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Adicionar a coluna role_id de volta à tabela users
        await queryRunner.query(`
            ALTER TABLE users ADD COLUMN role_id bigint;
        `);

        // Migrar dados de volta
        await queryRunner.query(`
            UPDATE users u
            SET role_id = urm.role_id
            FROM user_role_mappings urm
            WHERE u.id = urm.user_id;
        `);

        // Remover chaves estrangeiras
        const table = await queryRunner.getTable("user_role_mappings");
        if (table) {
            const foreignKeys = table.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("user_role_mappings", foreignKey);
            }
        }

        // Remover a tabela
        await queryRunner.dropTable("user_role_mappings");
    }
}