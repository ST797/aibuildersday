import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { agentRun, project } from "@/db/schema";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser(request.headers);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = await getDb();
  const [record] = await db
    .select()
    .from(project)
    .where(and(eq(project.id, id), eq(project.userId, user.id)))
    .limit(1);

  if (!record) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const runs = await db
    .select()
    .from(agentRun)
    .where(eq(agentRun.projectId, id))
    .orderBy(asc(agentRun.createdAt));

  return Response.json({ project: record, runs });
}
