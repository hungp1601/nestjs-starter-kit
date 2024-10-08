import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { getConfig } from './src/services/app-config/configuration';

dotenv.config();

const {
  database: { host, port, password, user, dbName },
} = getConfig();

export default new DataSource({
  type: 'mysql',
  host,
  port,
  username: user,
  password,
  database: dbName,
  synchronize: true,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/**/migrations/*.ts'],
  subscribers: ['src/**/subscribers/*.subscriber.ts'],
});
