import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3'
  },
  useNullAsDefault: true,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

const db = knex(config);

export default db;
