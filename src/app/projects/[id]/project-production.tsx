"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

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

type ModuleOption = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  visual: string;
  image: string;
  prompt: string;
};

type ModuleGroup = {
  id: string;
  label: string;
  question: string;
  promptLabel: string;
  options: ModuleOption[];
};

const team = [
  { role: "story_director", initials: "SD", name: "Story Director", task: "Breaking the story into scenes" },
  { role: "world_curator", initials: "WC", name: "World Curator", task: "Casting and selecting modules" },
  { role: "shot_director", initials: "SH", name: "Shot Director", task: "Planning camera and lighting" },
  { role: "continuity_supervisor", initials: "CS", name: "Continuity", task: "Auditing the final storyboard" },
];

const moduleGroups: ModuleGroup[] = [
  {
    id: "characters",
    label: "Who",
    question: "Who is in the scene?",
    promptLabel: "Character",
    options: [
      { id: "mira", title: "Mira", detail: "Curious teenage lead", meta: "Warm, determined", visual: "MI", image: "/cast/mira.jpg", prompt: "Mira, a curious teenage lead with a warm and determined presence" },
      { id: "aria", title: "Aria", detail: "Enigmatic stranger", meta: "Quiet, otherworldly", visual: "AR", image: "/cast/aria.jpg", prompt: "Aria, an enigmatic stranger with a quiet, otherworldly presence" },
      { id: "ishaan", title: "Ishaan", detail: "Grounded investigator", meta: "Calm, observant", visual: "IS", image: "/cast/ishaan.jpg", prompt: "Ishaan, a grounded investigator who is calm and observant" },
      { id: "dev", title: "Dev", detail: "Protective companion", meta: "Bright, loyal", visual: "DE", image: "/cast/dev.jpg", prompt: "Dev, a protective companion with a bright, loyal energy" },
    ],
  },
  {
    id: "locations",
    label: "Where",
    question: "Where does it happen?",
    promptLabel: "Location",
    options: [
      { id: "station", title: "Solace Station", detail: "Abandoned railway world", meta: "Night · Rain", visual: "SS", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80", prompt: "Solace Station, an abandoned railway world at night in the rain" },
      { id: "afterdark", title: "Neon Afterdark", detail: "Layered cyberpunk streets", meta: "Night · Neon", visual: "NA", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80", prompt: "Neon Afterdark, layered cyberpunk streets at night under neon light" },
      { id: "quiet-house", title: "The Quiet House", detail: "Modern domestic mystery", meta: "Dusk · Interior", visual: "QH", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80", prompt: "The Quiet House, a modern domestic mystery interior at dusk" },
      { id: "observatory", title: "Astra Observatory", detail: "Retro-future research post", meta: "Blue hour · Fog", visual: "AO", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80", prompt: "Astra Observatory, a retro-future research post in foggy blue hour" },
    ],
  },
  {
    id: "outfits",
    label: "Outfit",
    question: "What are they wearing?",
    promptLabel: "Outfit",
    options: [
      { id: "raincoat", title: "Night Raincoat", detail: "Weathered charcoal layers", meta: "Mira · Look 01", visual: "01", image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=80", prompt: "wearing a weathered charcoal night raincoat" },
      { id: "school", title: "After-school", detail: "Soft knit and canvas bag", meta: "Mira · Look 02", visual: "02", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80", prompt: "in soft after-school knit layers with a canvas bag" },
      { id: "field", title: "Field Layers", detail: "Utility jacket and boots", meta: "Unisex · Look 03", visual: "03", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", prompt: "in practical field layers with a utility jacket and boots" },
      { id: "timeless", title: "Timeless White", detail: "Dreamlike period silhouette", meta: "Aria · Look 04", visual: "04", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80", prompt: "in a dreamlike timeless white period silhouette" },
    ],
  },
  {
    id: "props",
    label: "Prop",
    question: "What do they hold?",
    promptLabel: "Prop",
    options: [
      { id: "lantern", title: "Antique Lantern", detail: "Time-revealing hero prop", meta: "Interactive · Brass", visual: "✦", image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=900&q=80", prompt: "holding an antique brass lantern that reveals hidden messages" },
      { id: "letter", title: "Hidden Letter", detail: "Aged handwritten message", meta: "Paper · Clue", visual: "✉", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80", prompt: "discovering a hidden aged handwritten letter" },
      { id: "key", title: "Brass Key", detail: "Weathered story artifact", meta: "Metal · Clue", visual: "⌘", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80", prompt: "carrying a weathered brass key that unlocks the next place" },
      { id: "watch", title: "Stopped Watch", detail: "Frozen at an impossible time", meta: "Metal · Continuity", visual: "◷", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80", prompt: "with a stopped watch frozen at an impossible time" },
    ],
  },
  {
    id: "cameras",
    label: "Camera",
    question: "How is it framed?",
    promptLabel: "Camera",
    options: [
      { id: "cinematic", title: "Cinematic 35mm", detail: "Natural perspective and depth", meta: "Primary package", visual: "35", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80", prompt: "shot on cinematic 35mm with natural perspective and depth" },
      { id: "wide", title: "Wide 24mm", detail: "World-first establishing frames", meta: "Architecture", visual: "24", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80", prompt: "framed on wide 24mm for establishing architecture and world scale" },
      { id: "portrait", title: "Portrait 85mm", detail: "Intimate emotional close-ups", meta: "Character", visual: "85", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80", prompt: "framed on portrait 85mm for intimate emotional close-ups" },
      { id: "macro", title: "Macro 100mm", detail: "Lantern and message details", meta: "Insert shots", visual: "M", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80", prompt: "captured with macro 100mm for intimate prop and message detail" },
    ],
  },
  {
    id: "movement",
    label: "Move",
    question: "How does the camera move?",
    promptLabel: "Movement",
    options: [
      { id: "push", title: "Slow Push", detail: "Build tension toward discovery", meta: "Dolly · Controlled", visual: "→", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80", prompt: "with a slow controlled push-in toward the discovery" },
      { id: "follow", title: "Handheld Follow", detail: "Stay close to the search", meta: "Human · Urgent", visual: "↝", image: "https://images.unsplash.com/photo-1493804714600-6edb1cd93080?auto=format&fit=crop&w=900&q=80", prompt: "with urgent handheld follow movement staying close to the search" },
      { id: "locked", title: "Locked-off", detail: "Let time move inside frame", meta: "Tripod · Still", visual: "▣", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80", prompt: "from a locked-off tripod frame where time moves inside the shot" },
      { id: "orbit", title: "Orbit Reveal", detail: "Reveal messages around the lead", meta: "Circular · Hero", visual: "↻", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=900&q=80", prompt: "with a circular orbit reveal around the character and clue" },
    ],
  },
  {
    id: "lighting",
    label: "Light",
    question: "What is the light?",
    promptLabel: "Lighting",
    options: [
      { id: "lantern-light", title: "Lantern Amber", detail: "Warm practical against darkness", meta: "Key · Motivated", visual: "LA", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80", prompt: "lit by warm lantern amber practical light against darkness" },
      { id: "moonlight", title: "Cold Moonlight", detail: "Blue shafts through the station", meta: "Fill · Cool", visual: "CM", image: "https://images.unsplash.com/photo-1532767153582-af1f962c4c52?auto=format&fit=crop&w=900&q=80", prompt: "lit by cold moonlight with blue shafts cutting through the space" },
      { id: "emergency", title: "Emergency Red", detail: "A warning from the last train", meta: "Accent · Pulsing", visual: "ER", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=900&q=80", prompt: "lit with pulsing emergency red as a warning accent" },
      { id: "silver", title: "Silver Rain", detail: "Reflective platform atmosphere", meta: "Ambient · Soft", visual: "SR", image: "https://images.unsplash.com/photo-1428592953211-077101b2021b?auto=format&fit=crop&w=900&q=80", prompt: "lit by soft silver rain reflections across the platform" },
    ],
  },
];

function ArrowLeft() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>;
}

function Check() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" /></svg>;
}

function Sparkles() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3-1.2 3.4L7.5 8l3.3 1.5L12 13l1.2-3.5L16.5 8l-3.3-1.6L12 3Z" /><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14Z" /></svg>;
}

function CopyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5h10" /></svg>;
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

function buildPrompt(story: string, picks: Record<string, ModuleOption>) {
  const character = picks.characters;
  const location = picks.locations;
  const outfit = picks.outfits;
  const prop = picks.props;
  const camera = picks.cameras;
  const movement = picks.movement;
  const lighting = picks.lighting;

  return [
    "Create a cinematic production scene from this story.",
    "",
    `STORY`,
    story.trim(),
    "",
    "DIRECTION",
    `Character: ${character.prompt}.`,
    `Location: ${location.prompt}.`,
    `Outfit: ${outfit.prompt}.`,
    `Prop: ${prop.prompt}.`,
    `Camera: ${camera.prompt}.`,
    `Movement: ${movement.prompt}.`,
    `Lighting: ${lighting.prompt}.`,
    "",
    "STYLE",
    "Keep continuity across the scene. Cinematic, grounded, emotionally clear, and ready to paste into an image or video model.",
  ].join("\n");
}

function PromptStudio({ story }: { story: string }) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(moduleGroups.map((group) => [group.id, group.options[0].id])),
  );
  const [step, setStep] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const group = moduleGroups[step];

  const picks = useMemo(() => {
    return Object.fromEntries(
      moduleGroups.map((group) => {
        const option = group.options.find((item) => item.id === selected[group.id]) ?? group.options[0];
        return [group.id, option];
      }),
    ) as Record<string, ModuleOption>;
  }, [selected]);

  const prompt = useMemo(() => buildPrompt(story, picks), [picks, story]);

  function choose(groupId: string, optionId: string) {
    setSelected((current) => ({ ...current, [groupId]: optionId }));
    setFlash(groupId);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 900);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  return (
    <section className="prompt-studio">
      <div className="how-strip">
        <span><b>1</b> Tap a picture</span>
        <span><b>2</b> Watch the prompt change</span>
        <span><b>3</b> Copy it</span>
      </div>

      <div className="prompt-board">
        <div className="prompt-chooser">
          <p className="story-chip">Your story · {story.trim()}</p>
          <div className="step-nav" role="tablist" aria-label="Prompt choices">
            {moduleGroups.map((item, index) => (
              <button
                aria-selected={index === step}
                className={index === step ? "on" : ""}
                key={item.id}
                onClick={() => setStep(index)}
                role="tab"
                type="button"
              >
                <small>{index + 1}</small>
                {item.label}
              </button>
            ))}
          </div>
          <div className="chooser-head">
            <h2>{group.question}</h2>
            <p>Selected: {picks[group.id].title}</p>
          </div>
          <div className="look-grid" role="listbox" aria-label={group.question}>
            {group.options.map((option, index) => {
              const isSelected = selected[group.id] === option.id;
              return (
                <button
                  aria-selected={isSelected}
                  className={`look-card ${isSelected ? "selected" : ""}`}
                  key={option.id}
                  onClick={() => choose(group.id, option.id)}
                  role="option"
                  type="button"
                >
                  <img alt="" src={option.image} />
                  <span className="look-copy">
                    <strong>{option.title}</strong>
                    <small>{option.detail}</small>
                  </span>
                  {index === 0 && <em>Suggested</em>}
                  {isSelected && <i><Check /></i>}
                </button>
              );
            })}
          </div>
          <div className="step-move">
            <button disabled={step === 0} onClick={() => setStep((current) => current - 1)} type="button">Back</button>
            <button disabled={step === moduleGroups.length - 1} onClick={() => setStep((current) => current + 1)} type="button">Next choice</button>
          </div>
        </div>

        <aside className="prompt-stage" aria-live="polite">
          <div className="prompt-stage-head">
            <div>
              <p className="production-eyebrow">LIVE PROMPT</p>
              <h3>Ready to paste</h3>
            </div>
            <span className="prompt-pulse">{flash ? `${moduleGroups.find((group) => group.id === flash)?.label} updated` : "Listening to your picks"}</span>
          </div>

          <div className="prompt-paper">
            <p className="prompt-line lead">Create a cinematic production scene from this story.</p>

            <div className="prompt-block">
              <span>STORY</span>
              <p>{story.trim()}</p>
            </div>

            <div className="prompt-block">
              <span>DIRECTION</span>
              {moduleGroups.map((group) => {
                const option = picks[group.id];
                return (
                  <p className={`prompt-line ${flash === group.id ? "hot" : ""}`} key={group.id}>
                    <b>{group.promptLabel}</b>
                    <span>{option.prompt}.</span>
                  </p>
                );
              })}
            </div>

            <div className="prompt-block">
              <span>STYLE</span>
              <p>Keep continuity across the scene. Cinematic, grounded, emotionally clear, and ready to paste into an image or video model.</p>
            </div>
          </div>

          <div className="prompt-actions">
            <button className={`prompt-copy wide ${copied ? "copied" : ""}`} onClick={copyPrompt} type="button">
              {copied ? <><Check /> Prompt copied</> : <><CopyIcon /> Copy full prompt</>}
            </button>
            <p>{prompt.split(/\s+/).filter(Boolean).length} words · updates instantly</p>
          </div>
        </aside>
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
  const isComplete = data.project.status === "completed" && Boolean(finalOutput);

  return (
    <main className={`production-page ${isComplete ? "prompt-mode" : ""}`}>
      <header className="production-topbar">
        <Link href="/studio"><ArrowLeft /> Studio</Link>
        <div className="production-brand"><span><Sparkles /></span> PREVIEWS</div>
        <span className={`production-status ${data.project.status}`}>{label(data.project.status)}</span>
      </header>

      <div className="production-layout">
        <aside className="production-story">
          <p className="production-eyebrow">{isComplete ? "INPUT" : "YOUR STORY"}</p>
          <h1>{data.project.title}</h1>
          <p className="story-copy">{data.project.story}</p>
          <div className="project-meta">
            <span>{isComplete ? "Story in" : "Project ID"}</span>
            <code>{isComplete ? "Prompt out" : data.project.id.slice(0, 8)}</code>
          </div>
        </aside>

        <section className="production-workspace">
          {!isComplete && (
            <>
              <div className="production-heading">
                <div>
                  <p className="production-eyebrow">AGENTIC PRODUCTION</p>
                  <h2>Your crew is building the world.</h2>
                  <p>Each specialist hands structured context to the next, then we turn it into a prompt you can paste.</p>
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
            </>
          )}

          {(pipelineError || data.project.error) && (
            <div className="pipeline-error">
              <div><strong>Production paused</strong><p>{pipelineError || data.project.error}</p></div>
              <button onClick={retry} type="button">Try again</button>
            </div>
          )}

          {finalOutput && (
            <section className="storyboard-result">
              <PromptStudio story={data.project.story} />
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
