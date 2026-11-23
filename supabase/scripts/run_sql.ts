// supabase/scripts/run_sql.ts
// Compliance: AGENTS.md Rules 1, 4, 7, 10
// Executes a target SQL file against the database using DATABASE_URL from .env.local.

import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || DATABASE_URL.trim() === "" || DATABASE_URL.includes("[YOUR-PASSWORD]")) {
  console.error("ERROR: DATABASE_URL is not configured in .env.local.");
  console.error("Please add your direct PostgreSQL connection URI to .env.local:");
  console.error("DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres");
  process.exit(1);
}

const targetFile = process.argv[2];

if (!targetFile) {
  console.error("Usage: tsx --env-file=.env.local supabase/scripts/run_sql.ts <path-to-sql-file>");
  process.exit(1);
}

const resolvedPath = path.resolve(process.cwd(), targetFile);

if (!fs.existsSync(resolvedPath)) {
  console.error(`ERROR: Target SQL file not found: ${resolvedPath}`);
  process.exit(1);
}

async function run(): Promise<void> {
  const sql = fs.readFileSync(resolvedPath, "utf-8");
  console.log(`Connecting to database to execute: ${path.basename(resolvedPath)}...`);

  // Configure SSL for Supabase PostgreSQL
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Database connection established.");
    console.log(`Executing SQL (${sql.length} bytes)...`);

    const startTime = Date.now();
    await client.query(sql);
    const duration = Date.now() - startTime;

    console.log(`SUCCESS: ${path.basename(resolvedPath)} executed cleanly in ${duration}ms.`);
  } catch (err: any) {
    console.error(`FAILURE: Error executing ${path.basename(resolvedPath)}:`, err.message);
    if (err.detail) console.error("Detail:", err.detail);
    if (err.hint) console.error("Hint:", err.hint);
    if (err.position) console.error("Position:", err.position);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
