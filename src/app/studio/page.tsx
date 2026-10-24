import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/db";
import { studioPlan } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import Dashboard from "../dashboard";

export const instant = false;

export default async function StudioPage() {
  await connection();
  const requestHeaders = await headers();
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  const db = await getDb();
  const [plan] = await db.select().from(studioPlan).where(eq(studioPlan.userId, session.user.id));

  return <Dashboard userName={session.user.name} planId={plan?.planId ?? null} />;
}
