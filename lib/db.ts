import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10, // Número máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo de inatividade antes de encerrar a conexão
  options: `-c search_path=${process.env.DB_SCHEMA},public`, // Define o search_path para o schema estoque
});

pool.on('connect', () => {
  console.log('Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro no pool de conexões', err);
});

export default pool;