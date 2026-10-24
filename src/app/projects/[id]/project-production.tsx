"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

type ProjectRecord = {
  id: string;
  title: string;
  story: string;
  status: string;
  currentStage: string | null;
  finalOutput: Record<string, unknown> | null;
  error: string | null;
};

type RunRecord = {
  id: string;
  role: string;
  status: string;
  confidence: number | null;
  output: Record<string, unknown> | null;
  error: string | null;
};

type ProjectPayload = {
  project: ProjectRecord;
  runs: RunRecord[];
};

const team = [
  { role: "story_director", initials: "SD", name: "Story Director", task: "Breaking the story into scenes" },
  { role: "world_curator", initials: "WC", name: "World Curator", task: "Casting and selecting modules" },
  { role: "shot_director", initials: "SH", name: "Shot Director", task: "Planning camera and lighting" },
  { role: "continuity_supervisor", initials: "CS", name: "Continuity", task: "Auditing the final storyboard" },
];

const moduleGroups = [
  {
    id: "characters",
    label: "Characters",
    eyebrow: "CAST",
    options: [
      { id: "mira", title: "Mira", detail: "Curious teenage lead", meta: "Warm, determined", visual: "MI" },
      { id: "aria", title: "Aria", detail: "Enigmatic stranger", meta: "Quiet, otherworldly", visual: "AR" },
      { id: "ishaan", title: "Ishaan", detail: "Grounded investigator", meta: "Calm, observant", visual: "IS" },
      { id: "dev", title: "Dev", detail: "Protective companion", meta: "Bright, loyal", visual: "DE" },
    ],
  },
  {
    id: "locations",
    label: "Locations",
    eyebrow: "WORLD",
    options: [
      { id: "station", title: "Solace Station", detail: "Abandoned railway world", meta: "Night · Rain", visual: "SS" },
      { id: "afterdark", title: "Neon Afterdark", detail: "Layered cyberpunk streets", meta: "Night · Neon", visual: "NA" },
      { id: "quiet-house", title: "The Quiet House", detail: "Modern domestic mystery", meta: "Dusk · Interior", visual: "QH" },
      { id: "observatory", title: "Astra Observatory", detail: "Retro-future research post", meta: "Blue hour · Fog", visual: "AO" },
    ],
  },
  {
    id: "outfits",
    label: "Outfits",
    eyebrow: "WARDROBE",
    options: [
      { id: "raincoat", title: "Night Raincoat", detail: "Weathered charcoal layers", meta: "Mira · Look 01", visual: "01" },
      { id: "school", title: "After-school", detail: "Soft knit and canvas bag", meta: "Mira · Look 02", visual: "02" },
      { id: "field", title: "Field Layers", detail: "Utility jacket and boots", meta: "Unisex · Look 03", visual: "03" },
      { id: "timeless", title: "Timeless White", detail: "Dreamlike period silhouette", meta: "Aria · Look 04", visual: "04" },
    ],
  },
  {
    id: "props",
    label: "Props",
    eyebrow: "OBJECTS",
    options: [
      { id: "lantern", title: "Antique Lantern", detail: "Time-revealing hero prop", meta: "Interactive · Brass", visual: "✦" },
      { id: "letter", title: "Hidden Letter", detail: "Aged handwritten message", meta: "Paper · Clue", visual: "✉" },
      { id: "key", title: "Brass Key", detail: "Weathered story artifact", meta: "Metal · Clue", visual: "⌘" },
      { id: "watch", title: "Stopped Watch", detail: "Frozen at an impossible time", meta: "Metal · Continuity", visual: "◷" },
    ],
  },
  {
    id: "cameras",
    label: "Camera",
    eyebrow: "FRAMING",
    options: [
      { id: "cinematic", title: "Cinematic 35mm", detail: "Natural perspective and depth", meta: "Primary package", visual: "35" },
      { id: "wide", title: "Wide 24mm", detail: "World-first establishing frames", meta: "Architecture", visual: "24" },
      { id: "portrait", title: "Portrait 85mm", detail: "Intimate emotional close-ups", meta: "Character", visual: "85" },
      { id: "macro", title: "Macro 100mm", detail: "Lantern and message details", meta: "Insert shots", visual: "M" },
    ],
  },
  {
    id: "movement",
    label: "Movement",
    eyebrow: "MOTION",
    options: [
      { id: "push", title: "Slow Push", detail: "Build tension toward discovery", meta: "Dolly · Controlled", visual: "→" },
      { id: "follow", title: "Handheld Follow", detail: "Stay close to the search", meta: "Human · Urgent", visual: "↝" },
      { id: "locked", title: "Locked-off", detail: "Let time move inside frame", meta: "Tripod · Still", visual: "▣" },
      { id: "orbit", title: "Orbit Reveal", detail: "Reveal messages around Mira", meta: "Circular · Hero", visual: "↻" },
    ],
  },
  {
    id: "lighting",
    label: "Lighting",
    eyebrow: "ATMOSPHERE",
    options: [
      { id: "lantern-light", title: "Lantern Amber", detail: "Warm practical against darkness", meta: "Key · Motivated", visual: "LA" },
      { id: "moonlight", title: "Cold Moonlight", detail: "Blue shafts through the station", meta: "Fill · Cool", visual: "CM" },
      { id: "emergency", title: "Emergency Red", detail: "A warning from the last train", meta: "Accent · Pulsing", visual: "ER" },
      { id: "silver", title: "Silver Rain", detail: "Reflective platform atmosphere", meta: "Ambient · Soft", visual: "SR" },
    ],
  },
] as const;

function ArrowLeft() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>;
}

function Check() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" /></svg>;
}

function Sparkles() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3-1.2 3.4L7.5 8l3.3 1.5L12 13l1.2-3.5L16.5 8l-3.3-1.6L12 3Z" /><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14Z" /></svg>;
}

function label(value: string) {
  if (value === "hitl_triggered") return "Ready";
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function isDone(status: string) {
  return status === "completed" || status === "hitl_triggered";
}

function OutputView({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) return <span className="output-muted">Not specified</span>;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <span>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <div className="output-list">
        {value.slice(0, 12).map((item, index) => (
          <div className="output-list-item" key={index}>
            <span className="output-index">{index + 1}</span>
            <OutputView value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div className={depth === 0 ? "output-object root" : "output-object"}>
        {Object.entries(value as Record<string, unknown>).slice(0, 20).map(([key, item]) => (
          <div className="output-field" key={key}>
            <strong>{label(key)}</strong>
            <OutputView value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function ModuleSelectionStudio() {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);

  function selectedId(groupId: string, fallbackId: string) {
    return selected[groupId] ?? fallbackId;
  }

  function choose(groupId: string, optionId: string) {
    setSelected((current) => ({ ...current, [groupId]: optionId }));
    setLocked(false);
  }

  return (
    <section className="kit">
      <div className="kit-intro">
        <div>
          <p className="production-eyebrow">YOUR CREATIVE KIT</p>
          <h2>Pick the look of this story.</h2>
          <p>Every card is a module. The first card in each row is the agent recommendation. Tap another card to swap it.</p>
        </div>
        <span className="agent-pick-badge"><Sparkles /> Agent picks ready</span>
      </div>

      {moduleGroups.map((group) => (
        <div className="kit-group" key={group.id}>
          <div className="kit-group-head">
            <div>
              <span>{group.eyebrow}</span>
              <h3>{group.label}</h3>
            </div>
            <p>Choose one</p>
          </div>
          <div className="kit-grid">
            {group.options.map((option, index) => {
              const isSelected = selectedId(group.id, group.options[0].id) === option.id;
              return (
                <button
                  aria-pressed={isSelected}
                  className={`kit-card tone-${index + 1} ${isSelected ? "selected" : ""}`}
                  key={option.id}
                  onClick={() => choose(group.id, option.id)}
                  type="button"
                >
                  <span className="kit-art">
                    <b>{option.visual}</b>
                    {index === 0 && <small>Agent pick</small>}
                    {isSelected && <i><Check /></i>}
                  </span>
                  <span className="kit-copy">
                    <strong>{option.title}</strong>
                    <span>{option.detail}</span>
                    <em>{option.meta}</em>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="selection-tray">
        <div>
          <p className="production-eyebrow">YOUR PACKAGE</p>
          <div className="selection-chips">
            {moduleGroups.map((item) => {
              const option = item.options.find((candidate) => candidate.id === selectedId(item.id, item.options[0].id)) ?? item.options[0];
              return <span key={item.id}><small>{item.label}</small>{option.title}</span>;
            })}
          </div>
        </div>
        <button className={locked ? "locked" : ""} onClick={() => setLocked(true)} type="button">
          {locked ? <><Check /> Package locked</> : "Use this package"}
        </button>
      </div>
    </section>
  );
}

export default function ProjectProduction({ projectId }: { projectId: string }) {
  const [data, setData] = useState<ProjectPayload | null>(null);
  const [loadError, setLoadError] = useState("");
  const [pipelineError, setPipelineError] = useState("");
  const started = useRef(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
    const payload = await response.json() as ProjectPayload & { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Could not load this project.");
    setData(payload);
    return payload;
  }, [projectId]);

  const runPipeline = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    setPipelineError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/run`, { method: "POST" });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "The production team could not start.");
      await load();
    } catch (error) {
      setPipelineError(error instanceof Error ? error.message : "The production team could not start.");
    }
  }, [load, projectId]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function refresh() {
      try {
        const payload = await load();
        if (!active) return;
        if (payload.project.status === "queued" && !started.current) {
          void runPipeline();
        }
        if (!["completed", "failed"].includes(payload.project.status)) {
          timer = setTimeout(refresh, 1400);
        }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load this project.");
      }
    }

    void refresh();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [load, runPipeline]);

  function retry() {
    started.current = false;
    void runPipeline();
  }

  if (!data && !loadError) {
    return <main className="production-loading"><span className="production-spinner" /><p>Opening your production room…</p></main>;
  }
  if (loadError || !data) {
    return <main className="production-loading"><p>{loadError}</p><Link href="/studio">Return to studio</Link></main>;
  }

  const completeCount = team.filter(({ role }) => data.runs.some((run) => run.role === role && isDone(run.status))).length;
  const progress = data.project.status === "completed" ? 100 : Math.max(7, completeCount * 25);
  const finalOutput = data.project.finalOutput;

  return (
    <main className="production-page">
      <header className="production-topbar">
        <Link href="/studio"><ArrowLeft /> Studio</Link>
        <div className="production-brand"><span><Sparkles /></span> PREVIEWS</div>
        <span className={`production-status ${data.project.status}`}>{label(data.project.status)}</span>
      </header>

      <div className="production-layout">
        <aside className="production-story">
          <p className="production-eyebrow">YOUR STORY</p>
          <h1>{data.project.title}</h1>
          <p className="story-copy">{data.project.story}</p>
          <div className="project-meta">
            <span>Project ID</span>
            <code>{data.project.id.slice(0, 8)}</code>
          </div>
        </aside>

        <section className="production-workspace">
          <div className="production-heading">
            <div>
              <p className="production-eyebrow">AGENTIC PRODUCTION</p>
              <h2>{data.project.status === "completed" ? "Your storyboard is ready." : "Your crew is building the world."}</h2>
              <p>{data.project.status === "completed" ? "Four specialist agents completed the production pass." : "Each specialist hands structured context to the next."}</p>
            </div>
            <div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as CSSProperties}>
              <span>{progress}%</span>
            </div>
          </div>

          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>

          <div className="production-team">
            {team.map((agent, index) => {
              const run = [...data.runs].reverse().find((item) => item.role === agent.role);
              const isActive = data.project.currentStage === agent.role && data.project.status === "running";
              const status = run?.status ?? (index === 0 && data.project.currentStage === "agent_setup" ? "provisioning" : "waiting");
              const done = isDone(status);
              return (
                <article className={`production-agent ${done ? "completed" : status} ${isActive ? "active" : ""}`} key={agent.role}>
                  <div className={`production-avatar agent-${index + 1}`}>{agent.initials}</div>
                  <div className="production-agent-copy">
                    <span className="agent-step">0{index + 1}</span>
                    <h3>{agent.name}</h3>
                    <p>{done ? "Pass complete" : isActive ? agent.task : label(status)}</p>
                  </div>
                  <div className="agent-state">
                    {done ? <span className="state-check"><Check /></span> : isActive || status === "provisioning" ? <span className="state-pulse" /> : <span className="state-wait" />}
                    {run?.confidence !== null && run?.confidence !== undefined && <small>{run.confidence}%</small>}
                  </div>
                </article>
              );
            })}
          </div>

          {(pipelineError || data.project.error) && (
            <div className="pipeline-error">
              <div><strong>Production paused</strong><p>{pipelineError || data.project.error}</p></div>
              <button onClick={retry}>Try again</button>
            </div>
          )}

          {finalOutput && (
            <section className="storyboard-result">
              <ModuleSelectionStudio />
              <details className="agent-output-drawer">
                <summary><span>Agent production notes</span><small>View structured outputs</small></summary>
                <div className="agent-output-drawer-body">
                  {team.map((agent) => {
                    const value = finalOutput[agent.role];
                    if (!value) return null;
                    return (
                      <details className="result-section" key={agent.role}>
                        <summary><span>{agent.name}</span><small>View structured output</small></summary>
                        <OutputView value={value} />
                      </details>
                    );
                  })}
                </div>
              </details>
            </section>
          )}

          {!finalOutput && !pipelineError && !data.project.error && (
            <div className="production-note"><Sparkles /><span>Agent activity is persisted to D1 and governed by AgenticOrg.</span></div>
          )}
        </section>
      </div>
    </main>
  );
}
