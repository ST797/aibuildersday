import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Add it to .env.local (e.g. file:./local.db) or your Vercel project env.",
    );
  }
  return url;
}

let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export async function getDb() {
  if (!db) {
    const client = createClient({
      url: requireDatabaseUrl(),
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    db = drizzle(client, { schema });
  }
  return db;
}
