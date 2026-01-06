import bcrypt from "bcryptjs";
import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

async function upsertUser(username, password) {
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `
    insert into users (username, password_hash)
    values ($1, $2)
    on conflict (username)
    do update set password_hash = excluded.password_hash
    `,
    [username, hash]
  );

  console.log("ok:", username);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL kosong. cek .env.local");
  }

  // GANTI password ini sesukamu
  await upsertUser("yodha", "yodha1551");
  await upsertUser("karin", "karin11");
  await upsertUser("nida", "nida123");

  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  try { await pool.end(); } catch {}
  process.exit(1);
});
