import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Dashboard from "../dashboard";
import { getAuth } from "@/lib/auth";

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

  return <Dashboard userName={session.user.name} />;
}
