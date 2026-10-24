import { count, desc } from "drizzle-orm";
import { connection } from "next/server";
import { getDb } from "@/db";
import { user } from "@/db/schema";

export type StudioPeople = {
  total: number;
  names: string[];
};

export async function listPeople(): Promise<StudioPeople> {
  await connection();
  const db = await getDb();
  const [totals, recent] = await Promise.all([
    db.select({ total: count() }).from(user),
    db.select({ name: user.name }).from(user).orderBy(desc(user.createdAt)).limit(4),
  ]);

  return {
    total: totals[0]?.total ?? 0,
    names: recent.map((row) => row.name.trim()).filter(Boolean),
  };
}
