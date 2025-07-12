import os
import mysql.connector
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# Mapeamento de tipos de dados de MySQL para PostgreSQL
TYPE_MAPPING = {
    'int': 'integer',
    'tinyint': 'smallint',
    'smallint': 'smallint',
    'mediumint': 'integer',
    'bigint': 'bigint',
    'float': 'real',
    'double': 'double precision',
    'decimal': 'numeric',
    'char': 'text',  # Convertido para text para evitar problemas de tamanho
    'varchar': 'varchar',
    'text': 'text',
    'tinytext': 'text',
    'mediumtext': 'text',
    'longtext': 'text',
    'date': 'date',
    'datetime': 'timestamp',
    'timestamp': 'timestamp',
    'time': 'time',
    'year': 'integer',
    'binary': 'bytea',
    'varbinary': 'bytea',
    'blob': 'bytea',
    'tinyblob': 'bytea',
    'mediumblob': 'bytea',
    'longblob': 'bytea',
    'enum': 'varchar', # Simplificando enum para varchar
    'set': 'varchar',  # Simplificando set para varchar
    'json': 'jsonb',
}

def get_mysql_connection():
    """Estabelece conexão com o banco de dados MySQL."""
    try:
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE'),
            port=os.getenv('MYSQL_PORT', 3306),
            ssl_disabled=os.getenv('MYSQL_SSL', 'false').lower() != 'true'
        )
        print("Conexão com MySQL bem-sucedida.")
        return conn
    except mysql.connector.Error as err:
        print(f"Erro ao conectar ao MySQL: {err}")
        exit(1)

def get_postgres_connection():
    """Estabelece conexão com o banco de dados PostgreSQL."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            dbname=os.getenv('DB_NAME'),
            port=os.getenv('DB_PORT', 5432)
        )
        print("Conexão com PostgreSQL bem-sucedida.")
        return conn
    except psycopg2.Error as err:
        print(f"Erro ao conectar ao PostgreSQL: {err}")
        exit(1)

def convert_create_table_syntax(create_table_statement):
    """Converte a sintaxe de CREATE TABLE de MySQL para PostgreSQL."""
    lines = create_table_statement.split('\n')
    table_name = ''
    column_definitions = []

    for line in lines:
        line = line.strip()
        if line.lower().startswith('create table'):
            table_name = line.split('`')[1]
            continue
        
        if not line.startswith('`'):
            continue

        parts = line.split()
        col_name = parts[0].strip('`')
        
        if col_name.lower() in ('primary', 'key', 'unique', 'constraint'):
            continue

        col_type_str = parts[1].lower()
        col_type = col_type_str.split('(')[0]
        
        pg_type = TYPE_MAPPING.get(col_type, 'varchar')

        if '(' in col_type_str and pg_type not in ('text', 'jsonb', 'bytea'):
            size = col_type_str.split('(')[1].split(')')[0]
            if size.isnumeric() or (',' in size and all(p.strip().isnumeric() for p in size.split(','))):
                 pg_type = f"{pg_type}({size})"

        column_definitions.append(f'    "{col_name}" {pg_type}')

    if not column_definitions:
        return f'CREATE TABLE public."{table_name}" ();'

    create_sql = f'CREATE TABLE public."{table_name}" (\n'
    create_sql += ',\n'.join(column_definitions)
    create_sql += '\n);'
    
    return create_sql


def main():
    """Função principal para sincronizar os bancos de dados."""
    load_dotenv()
    mysql_conn = get_mysql_connection()
    pg_conn = get_postgres_connection()
    
    mysql_cursor = mysql_conn.cursor()
    pg_cursor = pg_conn.cursor()

    try:
        mysql_cursor.execute("SHOW TABLES")
        tables = [table[0] for table in mysql_cursor.fetchall()]
        
        print(f"Encontradas {len(tables)} tabelas no banco de dados MySQL.")

        for table_name in tables:
            print(f"\nProcessando tabela: {table_name}")

            mysql_cursor.execute(f"SHOW CREATE TABLE `{table_name}`")
            create_statement = mysql_cursor.fetchone()[1]
            pg_create_statement = convert_create_table_syntax(create_statement)
            
            print(f"  - Recriando tabela '{table_name}' no PostgreSQL...")
            try:
                pg_cursor.execute(sql.SQL('DROP TABLE IF EXISTS public.{} CASCADE').format(sql.Identifier(table_name)))
                pg_cursor.execute(pg_create_statement)
                print("  - Tabela recriada com sucesso.")
            except psycopg2.Error as e:
                print(f"  - ERRO ao recriar tabela '{table_name}': {e}")
                pg_conn.rollback()
                continue

            print(f"  - Copiando dados...")
            mysql_cursor.execute(f"SELECT * FROM `{table_name}`")
            rows = mysql_cursor.fetchall()
            
            if not rows:
                print("  - Tabela vazia, nenhum dado para copiar.")
                pg_conn.commit()
                continue

            column_names = [desc[0] for desc in mysql_cursor.description]
            insert_query = sql.SQL("INSERT INTO public.{} ({}) VALUES %s").format(
                sql.Identifier(table_name),
                sql.SQL(', ').join(map(sql.Identifier, column_names))
            )
            
            # Trata valores None corretamente para serem inseridos como NULL
            data_to_insert = []
            for row in rows:
                new_row = []
                for value in row:
                    if value is None:
                        new_row.append(None)
                    else:
                        new_row.append(value) # Não converte para string aqui
                data_to_insert.append(tuple(new_row))

            try:
                from psycopg2.extras import execute_values
                execute_values(pg_cursor, insert_query, data_to_insert)
                print(f"  - {len(rows)} linhas copiadas com sucesso.")
            except Exception as e:
                print(f"  - ERRO ao copiar dados para '{table_name}': {e}")
                pg_conn.rollback()
                continue
            
            pg_conn.commit()

        print("\nSincronização concluída com sucesso!")

    except Exception as e:
        print(f"\nOcorreu um erro inesperado: {e}")
        if pg_conn:
            pg_conn.rollback()
    finally:
        if mysql_conn and mysql_conn.is_connected():
            mysql_cursor.close()
            mysql_conn.close()
            print("Conexão com MySQL fechada.")
        if pg_conn:
            pg_cursor.close()
            pg_conn.close()
            print("Conexão com PostgreSQL fechada.")

if __name__ == "__main__":
    main()