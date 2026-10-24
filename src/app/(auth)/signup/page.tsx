import { count } from "drizzle-orm";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import AuthForm from "../auth-form";
import AuthShell from "../auth-shell";

export const metadata: Metadata = {
  title: "Create your studio — PREVIEWS",
};

export const instant = false;

async function countPeople() {
  await connection();
  const db = await getDb();
  const [row] = await db.select({ total: count() }).from(user);
  return row?.total ?? 0;
}

export default async function SignupPage() {
  let people: number | null = null;
  try {
    people = await countPeople();
  } catch {
    people = null;
  }

  return (
    <AuthShell
      eyebrow="START CREATING"
      title="Build your first world."
      description="Create a studio and turn the story in your head into a production-ready universe."
      people={people}
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
