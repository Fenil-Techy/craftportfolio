import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL or DIRECT_DATABASE_URL is not set in env.');
}

async function main() {
  console.log('[DB] Connecting to database...');
  const sql = neon(url as string);
  const db = drizzle(sql);
  
  console.log('[DB] Running migrations from ./drizzle ...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('[DB] Migrations completed successfully!');
}

main().catch((err) => {
  console.error('[DB] Migration failed:', err);
  process.exit(1);
});
