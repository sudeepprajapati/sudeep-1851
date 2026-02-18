import 'dotenv/config';
import { DataSource } from 'typeorm';
export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : false,
    entities: [`${__dirname}/../**/*.entity.{ts,js}`],
    migrations: [`${__dirname}/migrations/*.{ts,js}`],
    synchronize: false,
    logging:
        process.env.NODE_ENV === 'development'
            ? ['query', 'error']
            : ['error'],
});
