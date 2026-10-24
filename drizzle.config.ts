import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required (set it in .env.local).");
}

const isRemote = url.startsWith("libsql:") || url.startsWith("https:");

export default defineConfig(
  isRemote
    ? {
        dialect: "turso",
        schema: "./src/db/schema.ts",
        out: "./migrations",
        dbCredentials: {
          url,
          authToken: process.env.DATABASE_AUTH_TOKEN,
        },
      }
    : {
        dialect: "sqlite",
        schema: "./src/db/schema.ts",
        out: "./migrations",
        dbCredentials: {
          url,
        },
      },
);
