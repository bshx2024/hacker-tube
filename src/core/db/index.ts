import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'path';
import * as schema from './schema';

const isProduction = process.env.NODE_ENV === 'production';
const defaultDbPath = path.join(process.cwd(), 'data', 'hackertube.db');
const dbUrl = process.env.DATABASE_URL || `file:${defaultDbPath}`;

const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };
