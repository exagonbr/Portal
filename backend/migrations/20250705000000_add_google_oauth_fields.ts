import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGoogleOAuthFields20250705000000 implements MigrationInterface {
  name = 'AddGoogleOAuthFields20250705000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar campo google_id
    await queryRunner.addColumn('user', new TableColumn({
      name: 'google_id',
      type: 'varchar',
      length: '255',
      isNullable: true,
      isUnique: true,
      comment: 'ID único do usuário no Google OAuth'
    }));

    // Adicionar campo profile_image
    await queryRunner.addColumn('user', new TableColumn({
      name: 'profile_image',
      type: 'varchar',
      length: '500',
      isNullable: true,
      comment: 'URL da imagem de perfil do usuário'
    }));

    // Adicionar campo email_verified
    await queryRunner.addColumn('user', new TableColumn({
      name: 'email_verified',
      type: 'boolean',
      default: false,
      isNullable: true,
      comment: 'Indica se o email do usuário foi verificado'
    }));

    console.log('✅ Campos do Google OAuth adicionados com sucesso:');
    console.log('   - google_id (varchar 255, unique)');
    console.log('   - profile_image (varchar 500)');
    console.log('   - email_verified (boolean, default false)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover os campos na ordem inversa
    await queryRunner.dropColumn('user', 'email_verified');
    await queryRunner.dropColumn('user', 'profile_image');
    await queryRunner.dropColumn('user', 'google_id');

    console.log('❌ Campos do Google OAuth removidos:');
    console.log('   - google_id');
    console.log('   - profile_image');
    console.log('   - email_verified');
  }
} 