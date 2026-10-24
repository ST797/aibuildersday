import Link from "next/link";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getDb } from "@/db";
import { studioPlan } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { isPlanId } from "@/lib/plans";
import PlanPicker from "./plan-picker";

export const instant = false;

export default async function PlansPage() {
  await connection();
  const requestHeaders = await headers();
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect("/login");

  const db = await getDb();
  const [row] = await db.select().from(studioPlan).where(eq(studioPlan.userId, session.user.id));
  const current = isPlanId(row?.planId) ? row.planId : null;

  return (
    <main className="plans-page">
      <header className="production-topbar">
        <Link href="/studio">Studio</Link>
        <div className="production-brand"><span /><strong>PREVIEWS</strong></div>
        <span className="production-status">Plans</span>
      </header>
      <div className="plans-wrap">
        <p className="eyebrow">ONE PLAN</p>
        <h1>Choose how you want to work.</h1>
        <p className="plans-lead">Pick one. Studio Quarter keeps the crew open for three months. The Production Bundle adds the right to use what you export. Usage Rights covers work you already finished. You can hold only one at a time.</p>
        <PlanPicker current={current} />
      </div>
    </main>
  );
}
