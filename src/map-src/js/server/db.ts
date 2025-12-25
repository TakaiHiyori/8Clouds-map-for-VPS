import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'db_nagasawa',
  password: 'qw231hgf',
  database: 'test_database',
});

export default pool;