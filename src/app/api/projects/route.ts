import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { project } from "@/db/schema";
import { getCurrentUser } from "@/lib/current-user";

function projectTitle(story: string) {
  const firstLine = story
    .split(/[.!?\n]/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstLine) return "Untitled story";
  return firstLine.length > 64 ? `${firstLine.slice(0, 61)}...` : firstLine;
}

export async function GET(request: Request) {
  const user = await getCurrentUser(request.headers);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const projects = await db
    .select()
    .from(project)
    .where(eq(project.userId, user.id))
    .orderBy(desc(project.updatedAt))
    .limit(20);

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request.headers);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { story?: unknown } | null;
  const story = typeof body?.story === "string" ? body.story.trim() : "";
  if (story.length < 20) {
    return Response.json(
      { error: "Give your production team at least 20 characters of story context." },
      { status: 400 },
    );
  }
  if (story.length > 10_000) {
    return Response.json({ error: "Stories must be under 10,000 characters." }, { status: 400 });
  }

  const db = await getDb();
  const id = crypto.randomUUID();
  await db.insert(project).values({
    id,
    userId: user.id,
    title: projectTitle(story),
    story,
    status: "queued",
    currentStage: "waiting",
  });

  return Response.json({ projectId: id }, { status: 201 });
}
