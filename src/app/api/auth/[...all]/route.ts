import { getAuth } from "@/lib/auth";

async function handler(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
