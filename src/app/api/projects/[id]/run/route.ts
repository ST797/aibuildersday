import { getCurrentUser } from "@/lib/current-user";
import { runProjectPipeline } from "@/lib/agenticorg";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser(request.headers);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const result = await runProjectPipeline(id, user.id);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Production pipeline failed.";
    const status = message === "Project not found." ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}
