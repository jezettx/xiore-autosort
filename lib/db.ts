import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL kosong. cek .env.local");
}

export const pool = new Pool({
  connectionString,
  ssl: true,
});
