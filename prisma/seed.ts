import { PrismaClient } from '@prisma/client';
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
          id: user.id.toString(), // Convertendo para string caso seja número
          email: user.email,
          name: user.name,
          password: user.password.startsWith('$2') ? user.password : await bcrypt.hash(user.password, 10),
          role: 'TEACHER', // Definindo role_id como TEACHER conforme solicitado
          is_active: user.is_active || true,
          phone: user.phone || null,
          avatar: user.avatar || null,
          created_at: user.created_at ? new Date(user.created_at) : new Date(),
          updated_at: user.updated_at ? new Date(user.updated_at) : new Date(),
        },
      });
    }
    console.log('Usuários importados com sucesso!');

    // Importar unidades escolares
    console.log('Importando unidades escolares...');
    const [mysqlUnits] = await mysqlConnection.execute('SELECT * FROM unit');
    
    for (const unit of mysqlUnits as any[]) {
      await prisma.school.create({
        data: {
          id: unit.id.toString(),
          name: unit.name,
          slug: unit.slug || unit.name.toLowerCase().replace(/\s+/g, '-'),
          description: unit.description || null,
          logo: unit.logo || null,
          phone: unit.phone || null,
          email: unit.email || null,
          address: unit.address ? JSON.parse(unit.address) : null,
          settings: unit.settings ? JSON.parse(unit.settings) : null,
          is_active: unit.is_active || true,
          institution: {
            connect: {
              id: unit.institution_id || (await getOrCreateDefaultInstitution()).id
            }
          },
          created_at: unit.created_at ? new Date(unit.created_at) : new Date(),
          updated_at: unit.updated_at ? new Date(unit.updated_at) : new Date(),
        },
      });
    }
    console.log('Unidades escolares importadas com sucesso!');

  } catch (error) {
    console.error('Erro durante a importação:', error);
    throw error;
  } finally {
    await mysqlConnection.end();
    await prisma.$disconnect();
  }
}

// Função auxiliar para criar ou obter a instituição padrão
async function getOrCreateDefaultInstitution() {
  let defaultInstitution = await prisma.institution.findFirst({
    where: { slug: 'default-institution' }
  });

  if (!defaultInstitution) {
    defaultInstitution = await prisma.institution.create({
      data: {
        name: 'Instituição Padrão',
        slug: 'default-institution',
        description: 'Instituição padrão criada durante a migração',
        is_active: true
      }
    });
  }

  return defaultInstitution;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 