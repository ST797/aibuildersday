import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/db";
import * as schema from "@/db/schema";

async function createAuth() {
  const db = await getDb();
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is missing. Add it to .env.local and your Vercel project env.",
    );
  }

  const configuredUrl = process.env.BETTER_AUTH_URL;
  const trustedOrigins = process.env.NODE_ENV === "production"
    ? [configuredUrl].filter((value): value is string => Boolean(value))
    : [configuredUrl, "http://localhost:*", "http://127.0.0.1:*"].filter((value): value is string => Boolean(value));

  return betterAuth({
    appName: "Worldweaver",
    baseURL: configuredUrl,
    trustedOrigins,
    secret,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 14,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      database: {
        generateId: "uuid",
      },
      useSecureCookies: process.env.NODE_ENV === "production",
    },
    plugins: [nextCookies()],
  });
}

type Auth = Awaited<ReturnType<typeof createAuth>>;
let authInstance: Auth | undefined;

export async function getAuth() {
  authInstance ??= await createAuth();
  return authInstance;
}
