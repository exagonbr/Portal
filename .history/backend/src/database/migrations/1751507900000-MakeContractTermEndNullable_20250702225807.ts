import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeContractTermEndNullable1751507900000 implements MigrationInterface {
    name = 'MakeContractTermEndNullable1751507900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tv_show" ALTER COLUMN "contract_term_end" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tv_show" ALTER COLUMN "contract_term_end" SET NOT NULL`);
    }
}