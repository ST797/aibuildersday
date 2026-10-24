import { getAuth } from "@/lib/auth";

export async function getCurrentUser(requestHeaders: Headers) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  return session?.user ?? null;
}
