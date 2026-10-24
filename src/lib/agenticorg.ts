import { and, eq } from "drizzle-orm";
import { AgenticOrg, toAgentRunResult, type AgentRunResult } from "agenticorg-sdk";
import { getDb } from "@/db";
import { agentConfig, agentRun, project } from "@/db/schema";

type AgentRole =
  | "story_director"
  | "world_curator"
  | "shot_director"
  | "continuity_supervisor";

type AgentDefinition = {
  role: AgentRole;
  agentId: string;
  name: string;
  action: string;
  description: string;
};

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    role: "story_director",
    agentId: "7d23b212-11e2-459b-811b-0bee677bd04e",
    name: "Story Director",
    action: "break_down_story",
    description: `Create and deploy an agent named "Story Director" in the creative domain.
Its only responsibility is to turn a raw story into production-ready scene structure.
It must return JSON with: title, logline, tone, and scenes. Each scene needs scene_number,
summary, location_requirements, time_of_day, mood, characters, action, dialogue, and
continuity_requirements. It must preserve the user's intent and never select camera angles,
specific marketplace assets, or generate prose outside the JSON response.`,
  },
  {
    role: "world_curator",
    agentId: "526e091b-f600-415e-8bfe-2f152af68d36",
    name: "World Curator",
    action: "select_modules",
    description: `Create and deploy an agent named "World Curator" in the creative domain.
It receives a structured story breakdown and an explicit catalog of available worlds,
characters, outfits, voices, and props. It must select only catalog items, explain every
selection, identify missing assets, and return JSON with world_selection, casting,
wardrobe, props, voice_assignments, alternatives, and missing_requirements. It must never
claim an unavailable asset exists.`,
  },
  {
    role: "shot_director",
    agentId: "7644c41f-8d0e-4c00-8859-90754baa94ea",
    name: "Shot Director",
    action: "plan_shots",
    description: `Create and deploy an agent named "Shot Director" in the creative domain.
It turns scenes and selected modules into a cinematic shot list. It may use only camera
positions and lighting states supplied by the selected world module. It must return JSON
with scenes containing ordered shots. Each shot needs shot_number, camera_position,
framing, lens_feel, lighting, character_blocking, action, duration_seconds, and rationale.
It must prioritize visual storytelling and production feasibility.`,
  },
  {
    role: "continuity_supervisor",
    agentId: "5895cad7-bf7d-4af2-949a-c1d8a744cbc3",
    name: "Continuity Supervisor",
    action: "review_storyboard",
    description: `Create and deploy an agent named "Continuity Supervisor" in the creative domain.
It audits a complete storyboard for character, wardrobe, prop, geography, time-of-day,
lighting, and camera continuity. It must return JSON with status ("approved" or
"revision_required"), score, issues, corrections, and approved_storyboard. Every issue
must identify the scene and shot, severity, conflicting facts, and the responsible agent.
It must fail closed when required information is missing.`,
  },
];

const MODULE_CATALOG = {
  worlds: [
    {
      id: "world_neon_afterdark",
      name: "Neon Afterdark",
      type: "cyberpunk_city",
      times: ["night", "rainy_night"],
      camera_positions: ["street_level", "rooftop", "alley_corner", "shop_interior"],
      lighting: ["neon_magenta", "cold_blue", "street_amber"],
    },
    {
      id: "world_quiet_house",
      name: "The Quiet House",
      type: "modern_domestic",
      times: ["day", "golden_hour", "night"],
      camera_positions: ["kitchen_stove", "hallway", "living_room_wide", "staircase"],
      lighting: ["soft_daylight", "warm_practical", "cold_moonlight"],
    },
    {
      id: "world_solace_station",
      name: "Solace Station",
      type: "retro_science_fiction",
      times: ["station_day", "station_night"],
      camera_positions: ["observation_deck", "corridor", "airlock", "control_room"],
      lighting: ["sterile_white", "emergency_red", "planet_glow"],
    },
  ],
  characters: [
    { id: "char_maya", name: "Maya", archetype: "determined_architect", voices: ["maya_warm", "maya_calm"] },
    { id: "char_ishaan", name: "Ishaan", archetype: "curious_journalist", voices: ["ishaan_grounded"] },
    { id: "char_aria", name: "Aria", archetype: "enigmatic_stranger", voices: ["aria_airy", "aria_low"] },
    { id: "char_dev", name: "Dev", archetype: "protective_friend", voices: ["dev_bright"] },
  ],
  wardrobe: [
    { id: "outfit_maya_studio", character_id: "char_maya", description: "neutral architect studio wear" },
    { id: "outfit_maya_night", character_id: "char_maya", description: "dark rain-ready coat" },
    { id: "outfit_ishaan_field", character_id: "char_ishaan", description: "field reporter layers" },
  ],
  props: [
    { id: "prop_hidden_letter", name: "aged hidden letter" },
    { id: "prop_blueprint_roll", name: "architectural blueprint roll" },
    { id: "prop_brass_key", name: "weathered brass key" },
  ],
};

function createClient(apiKey: string, baseUrl?: string) {
  return new AgenticOrg({
    apiKey,
    baseUrl,
    timeout: 90_000,
  });
}

async function ensureAgent(definition: AgentDefinition) {
  const db = await getDb();
  await db.insert(agentConfig).values({
    role: definition.role,
    agentId: definition.agentId,
    name: definition.name,
  }).onConflictDoUpdate({
    target: agentConfig.role,
    set: { agentId: definition.agentId, name: definition.name },
  });
  return definition.agentId;
}

function resultOutput(result: AgentRunResult) {
  return result.output && Object.keys(result.output).length > 0
    ? result.output
    : { status: result.status, message: "The agent completed without structured output." };
}

function readString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key]) {
      return record[key] as string;
    }
  }
}

async function runAgentCompatible(
  client: AgenticOrg,
  definition: AgentDefinition,
  apiKey: string,
  baseUrl: string,
  options: {
    inputs: Record<string, unknown>;
    context: Record<string, unknown>;
  },
) {
  try {
    return await client.agents.run(definition.agentId, {
      action: definition.action,
      ...options,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("HTTP 404")) throw error;

    const legacyResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/a2a/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_type: definition.role,
        action: definition.action,
        inputs: options.inputs,
        context: options.context,
      }),
    });
    const legacyPayload = await legacyResponse.json() as Record<string, unknown>;
    if (legacyResponse.ok) {
      return toAgentRunResult(legacyPayload);
    }
    const legacyMessage = JSON.stringify(legacyPayload);
    if (!legacyMessage.toLowerCase().includes("company")) {
      throw new Error(`HTTP ${legacyResponse.status}: ${legacyMessage}`);
    }

    const agents = await client.agents.list();
    const registered = agents.find((candidate) => {
      const id = readString(candidate, ["id", "agent_id", "agentId"]);
      const type = readString(candidate, ["agent_type", "agentType", "type", "role"]);
      return id === definition.agentId || type === definition.role;
    });
    if (!registered) {
      throw new Error(`AgenticOrg could not discover the registered ${definition.name} agent.`);
    }

    const companyId = readString(registered, [
      "company_id",
      "companyId",
      "organization_id",
      "organizationId",
      "tenant_id",
      "tenantId",
    ]);
    if (!companyId) {
      throw new Error(
        `AgenticOrg's legacy runtime requires a company ID for ${definition.name}, but the agent registry did not return one.`,
      );
    }

    return client.agents.run(definition.role, {
      action: definition.action,
      companyId,
      ...options,
    });
  }
}

export async function runProjectPipeline(projectId: string, userId: string) {
  const db = await getDb();
  const [record] = await db
    .select()
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .limit(1);

  if (!record) {
    throw new Error("Project not found.");
  }
  if (record.status === "running") {
    return { status: "running" };
  }
  if (record.status === "completed") {
    return { status: "completed", output: record.finalOutput };
  }

  const apiKey = process.env.AGENTICORG_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AgenticOrg is not configured. Add AGENTICORG_API_KEY to .env.local and your Vercel project env.",
    );
  }

  const client = createClient(apiKey, process.env.AGENTICORG_BASE_URL);
  const outputs: Partial<Record<AgentRole, Record<string, unknown>>> = {};

  await db.update(project).set({
    status: "running",
    currentStage: "agent_setup",
    error: null,
    updatedAt: new Date(),
  }).where(eq(project.id, projectId));

  try {
    for (const definition of AGENT_DEFINITIONS) {
      const runId = crypto.randomUUID();
      await db.insert(agentRun).values({
        id: runId,
        projectId,
        role: definition.role,
        status: "provisioning",
      });
      await db.update(project).set({
        currentStage: definition.role,
        updatedAt: new Date(),
      }).where(eq(project.id, projectId));

      const agentId = await ensureAgent(definition);
      await db.update(agentRun).set({
        agentId,
        status: "running",
        startedAt: new Date(),
      }).where(eq(agentRun.id, runId));

      let result: AgentRunResult;
      try {
        result = await runAgentCompatible(
          client,
          definition,
          apiKey,
          process.env.AGENTICORG_BASE_URL ?? "https://app.agenticorg.ai",
          {
          inputs: {
            story: record.story,
            prior_agent_outputs: outputs,
            available_modules: MODULE_CATALOG,
            response_format: "Return only a valid JSON object matching your role instructions.",
          },
          context: {
            project_id: projectId,
            product: "Worldweaver",
          },
          },
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Agent execution failed.";
        await db.update(agentRun).set({
          status: "failed",
          error: message,
          completedAt: new Date(),
        }).where(eq(agentRun.id, runId));
        throw error;
      }

      outputs[definition.role] = resultOutput(result);
      await db.update(agentRun).set({
        remoteRunId: result.run_id,
        status: result.status === "completed" ? "completed" : result.status,
        confidence: Math.round((result.confidence ?? 0) * 100),
        output: outputs[definition.role],
        reasoningTrace: result.reasoning_trace ?? [],
        error: result.error,
        completedAt: new Date(),
      }).where(eq(agentRun.id, runId));
    }

    const finalOutput = {
      project: {
        id: projectId,
        title: record.title,
      },
      ...outputs,
    };
    await db.update(project).set({
      status: "completed",
      currentStage: "completed",
      finalOutput,
      error: null,
      updatedAt: new Date(),
    }).where(eq(project.id, projectId));

    return { status: "completed", output: finalOutput };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The production pipeline failed.";
    await db.update(project).set({
      status: "failed",
      error: message,
      updatedAt: new Date(),
    }).where(eq(project.id, projectId));
    throw error;
  }
}
