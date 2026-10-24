import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { studioPlan } from "@/db/schema";
import { getCurrentUser } from "@/lib/current-user";
import { isPlanId } from "@/lib/plans";

export async function GET(request: Request) {
  const user = await getCurrentUser(request.headers);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const [row] = await db.select().from(studioPlan).where(eq(studioPlan.userId, user.id));
  return Response.json({ planId: row?.planId ?? null });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request.headers);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { planId?: unknown } | null;
  if (!isPlanId(body?.planId)) {
    return Response.json({ error: "Choose Studio Quarter, the Production Bundle, or Usage Rights." }, { status: 400 });
  }

  const db = await getDb();
  const [existing] = await db.select().from(studioPlan).where(eq(studioPlan.userId, user.id));
  if (existing) {
    await db.update(studioPlan).set({ planId: body.planId, purchasedAt: new Date() }).where(eq(studioPlan.userId, user.id));
  } else {
    await db.insert(studioPlan).values({ userId: user.id, planId: body.planId, purchasedAt: new Date() });
  }

  return Response.json({ planId: body.planId });
}
