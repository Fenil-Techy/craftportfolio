import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL or DIRECT_DATABASE_URL is not set.');
}

async function main() {
  console.log('[BASELINE] Connecting to database...');
  const sql = neon(url as string);

  console.log('[BASELINE] Creating drizzle schema and __drizzle_migrations table...');
  await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`;
  
  await sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      "id" serial PRIMARY KEY,
      "hash" text NOT NULL,
      "created_at" bigint
    );
  `;

  const existing = await sql`SELECT count(*) as count FROM "drizzle"."__drizzle_migrations"`;
  const count = parseInt(existing[0]?.count || '0', 10);

  if (count > 0) {
    console.log('[BASELINE] Database already has migrations recorded in drizzle.__drizzle_migrations. Skipping baseline.');
    return;
  }

  // Find the 0000 migration file and read the journal
  const drizzleDir = path.resolve(process.cwd(), 'drizzle');
  const journalPath = path.join(drizzleDir, 'meta/_journal.json');
  if (!fs.existsSync(journalPath)) {
    console.error('[BASELINE] Journal not found. Cannot baseline.');
    return;
  }

  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
  const firstEntry = journal.entries?.[0];

  if (!firstEntry) {
    console.log('[BASELINE] No migration entries in journal. Skipping.');
    return;
  }

  const firstMigrationFile = `${firstEntry.tag}.sql`;
  const sqlFilePath = path.join(drizzleDir, firstMigrationFile);
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`[BASELINE] Migration file ${firstMigrationFile} not found.`);
    return;
  }

  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  // Drizzle ORM computes SHA-256 of the migration sql content
  const hash = crypto.createHash('sha256').update(sqlContent).digest('hex');
  const timestamp = firstEntry.when; // Exact timestamp of the migration folderMillis

  console.log(`[BASELINE] Baselining migration ${firstMigrationFile} with hash: ${hash} and timestamp: ${timestamp}`);
  await sql`INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES (${hash}, ${timestamp})`;
  console.log('[BASELINE] Database baselined successfully in drizzle schema!');
}

main().catch((err) => {
  console.error('[BASELINE] Error during baselining:', err);
  process.exit(1);
});
