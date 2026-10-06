import { neon, NeonQueryFunction } from "@neondatabase/serverless";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://neondb_owner:npg_r3wN5noeVyMb@ep-super-term-a51m2cj2-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";

let sqlInstance: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  if (!sqlInstance) {
    sqlInstance = neon(dbUrl);
  }
  return sqlInstance;
}
