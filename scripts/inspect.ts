import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set.');
}

async function main() {
  const sql = neon(url as string);
  const result = await sql`SELECT * FROM "__drizzle_migrations"`;
  console.log('[INSPECT] __drizzle_migrations rows:', result);
}

main().catch(console.error);
