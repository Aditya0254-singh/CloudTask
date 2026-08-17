import { Pool } from "pg";
import { env } from "./env";

// A single shared connection pool used across the whole application.
export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on("error", (err) => {
  // Catches errors on idle clients so the process doesn't crash silently.
  console.error("Unexpected PostgreSQL pool error:", err);
});

export async function checkDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}
