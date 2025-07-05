import { PrismaClient, UserRole } from '@prisma/client';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Configuração da conexão MySQL
  const mysqlConnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'old_database'
  });

  try {
    // Importar usuários
    console.log('Importando usuários...');
    const [mysqlUsers] = await mysqlConnection.execute('SELECT * FROM users');
    
    for (const user of mysqlUsers as any[]) {
      await prisma.user.create({
        data: {
          email: user.email,
          full_name: user.name || user.full_name || 'Nome não informado',
          password: user.password.startsWith('$2') ? user.password : await bcrypt.hash(user.password, 10),
          is_admin: false,
          is_manager: false,
          is_student: user.is_student || false,
          is_teacher: user.is_teacher || true,
          enabled: user.is_active || true,
          phone: user.phone || null,
          institution_id: user.institution_id || null,
        },
      });
    }
    console.log('Usuários importados com sucesso!');

    // Importar unidades escolares
    console.log('Importando unidades escolares...');
    const [mysqlUnits] = await mysqlConnection.execute('SELECT * FROM unit');
    
    for (const unit of mysqlUnits as any[]) {
      await prisma.schools.create({
        data: {
          name: unit.name,
          institution_id: unit.institution_id || (await getOrCreateDefaultInstitution()).id,
          institution_name: unit.institution_name || null,
        },
      });
    }
    console.log('Unidades escolares importadas com sucesso!');

  } catch (error) {
    console.log('Erro durante a importação:', error);
    throw error;
  } finally {
    await mysqlConnection.end();
    await prisma.$disconnect();
  }
}

// Função auxiliar para criar ou obter a instituição padrão
async function getOrCreateDefaultInstitution() {
  let defaultInstitution = await prisma.institution.findFirst({
    where: { name: 'Instituição Padrão' }
  });

  if (!defaultInstitution) {
    defaultInstitution = await prisma.institution.create({
      data: {
        accountable_contact: 'Contato Padrão',
        accountable_name: 'Nome Padrão',
        company_name: 'Instituição Padrão',
        contract_disabled: false,
        contract_term_end: new Date('2025-12-31'),
        contract_term_start: new Date('2024-01-01'),
        deleted: false,
        district: 'Distrito Padrão',
        document: '00000000000',
        name: 'Instituição Padrão',
        postal_code: '00000-000',
        state: 'SP',
        street: 'Rua Padrão, 123',
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true,
      }
    });
  }

  return defaultInstitution;
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  }); 