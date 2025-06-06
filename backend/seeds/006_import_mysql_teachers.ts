import * as knex from 'knex';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
    host:'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'sabercon',
    password:  'gWg28m8^vffI9X#',
    database: 'sabercon',
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

export async function seed(knexInstance: knex.Knex): Promise<void> {
  let mysqlConnection: mysql.Connection | null = null;

  try {
    // Connect to MySQL
    mysqlConnection = await mysql.createConnection(mysqlConfig);

    // Fetch users with tipo_usuario = 'professor' (teacher)
    const [mysqlUsers] = await mysqlConnection.execute(`
      SELECT 
        id, email, password, nome, cpf, telefone, data_nascimento,
        endereco, cidade, estado, cep, unidade_ensino, tipo_usuario,
        ativo, created_at, updated_at
      FROM usuarios 
      WHERE ativo = 1 AND LOWER(tipo_usuario) = 'professor'
    `);

    const users = mysqlUsers as any[];

    if (users.length === 0) {
      console.log('No teacher users found in MySQL to import.');
      return;
    }

    // Get teacher role id
    const teacherRole = await knexInstance('roles').where('name', 'TEACHER').first();
    if (!teacherRole) {
      throw new Error('Teacher role not found in roles table.');
    }

    // Get institutions for mapping
    const institutions = await knexInstance('institutions').select('id', 'code');

    let importedCount = 0;

    for (const user of users) {
      // Map institution id based on unidade_ensino
      let institutionId = institutions[0]?.id; // default to first institution
      if (user.unidade_ensino) {
        const matchedInstitution = institutions.find(inst =>
          inst.code.toLowerCase().includes(user.unidade_ensino.toLowerCase())
        );
        if (matchedInstitution) {
          institutionId = matchedInstitution.id;
        }
      }

      const pgUser = {
        email: user.email,
        password: user.password, // Assuming already hashed
        name: user.nome,
        cpf: user.cpf,
        phone: user.telefone,
        birth_date: user.data_nascimento ? new Date(user.data_nascimento) : null,
        address: user.endereco,
        city: user.cidade,
        state: user.estado,
        zip_code: user.cep,
        endereco: user.endereco,
        telefone: user.telefone,
        unidade_ensino: user.unidade_ensino,
        is_active: user.ativo !== false,
        role_id: teacherRole.id,
        institution_id: institutionId,
        created_at: user.created_at ? new Date(user.created_at) : new Date(),
        updated_at: user.updated_at ? new Date(user.updated_at) : new Date()
      };

      await knexInstance('users')
        .insert(pgUser)
        .onConflict('email')
        .merge(['name', 'phone', 'address', 'city', 'state', 'zip_code', 'updated_at']);

      importedCount++;
    }

    console.log(`Imported ${importedCount} teacher users from MySQL.`);
  } catch (error) {
    console.error('Error importing teacher users:', error);
    throw error;
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
  }
}
