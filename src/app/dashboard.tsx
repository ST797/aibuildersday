"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type IconName =
  | "home" | "sparkles" | "globe" | "users" | "shirt" | "box" | "camera" | "film"
  | "store" | "search" | "bell" | "arrow" | "plus" | "play" | "chevron"
  | "clock" | "heart";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    sparkles: <><path d="m12 3-1.2 3.4L7.5 8l3.3 1.5L12 13l1.2-3.5L16.5 8l-3.3-1.6L12 3Z" /><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 13l-.7 1.8-1.8.7 1.8.7L19 18l.7-1.8 1.8-.7L19 13Z" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9S14.4 18.5 12 21c-2.4-2.5-3.5-5.5-3.5-9S9.6 5.5 12 3Z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-4 2.4-6 6-6s6 2 6 6M16 5.5a3 3 0 0 1 0 5.8M18 14c2 .8 3 2.7 3 5" /></>,
    shirt: <path d="m8 4 4 2 4-2 5 3-3 5-2-1v10H8V11l-2 1-3-5 5-3Z" />,
    box: <><path d="m4 7 8-4 8 4-8 4-8-4ZM4 7v10l8 4 8-4V7M12 11v10" /></>,
    camera: <><path d="M4 8h3l2-2h6l2 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" /><circle cx="12" cy="14" r="3.2" /></>,
    film: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" /></>,
    store: <><path d="M4 10v10h16V10M3 10l2-6h14l2 6" /><path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2M9 20v-5h6v5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 22l8.9-8.4a5.5 5.5 0 0 0-.1-7.8Z" />,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

type LibraryCategory = "Worlds" | "Characters" | "Wardrobe" | "Props" | "Camera";
type StudioSection = "home" | Lowercase<LibraryCategory> | "projects" | "marketplace";

type LibraryCard = {
  id: string;
  name: string;
  category: LibraryCategory;
  type: string;
  meta: string;
  image: string;
  color: string;
  blurb: string;
};

type ProjectSummary = {
  id: string;
  title: string;
  story: string;
  status: string;
  updatedAt: string;
};

const library: LibraryCard[] = [
  { id: "neon", name: "Neon Afterdark", category: "Worlds", type: "Cyberpunk city", meta: "12 ready scenes", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85", color: "#c23b2e", blurb: "Rain, neon, and rooftop angles for night stories." },
  { id: "house", name: "The Quiet House", category: "Worlds", type: "Modern domestic", meta: "9 ready scenes", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85", color: "#8e241c", blurb: "Kitchen, hallway, and staircase camera positions." },
  { id: "station", name: "Solace Station", category: "Worlds", type: "Retro science fiction", meta: "16 ready scenes", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=85", color: "#a33b2e", blurb: "An abandoned railway world with day and night lighting." },
  { id: "coast", name: "Salt & Sun", category: "Worlds", type: "Coastal village", meta: "8 ready scenes", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85", color: "#d4533f", blurb: "Open shore, harbor light, and warm afternoon frames." },
  { id: "mira", name: "Mira", category: "Characters", type: "Curious lead", meta: "Warm voice", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85", color: "#c23b2e", blurb: "A determined teenage lead with a grounded voice." },
  { id: "aria", name: "Aria", category: "Characters", type: "Enigmatic stranger", meta: "Airy voice", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85", color: "#8e241c", blurb: "Quiet, otherworldly, and useful for mystery stories." },
  { id: "ishaan", name: "Ishaan", category: "Characters", type: "Investigator", meta: "Grounded voice", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85", color: "#a33b2e", blurb: "A calm observer who fits search and discovery scenes." },
  { id: "dev", name: "Dev", category: "Characters", type: "Protective friend", meta: "Bright voice", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85", color: "#d4533f", blurb: "Loyal, bright, and ready for partnership scenes." },
  { id: "raincoat", name: "Night Raincoat", category: "Wardrobe", type: "Mira · Look 01", meta: "Charcoal layers", image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=85", color: "#8e241c", blurb: "Weathered outerwear for rain and night searches." },
  { id: "school", name: "After-school", category: "Wardrobe", type: "Mira · Look 02", meta: "Soft knit", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85", color: "#c23b2e", blurb: "A softer everyday look for character close-ups." },
  { id: "field", name: "Field Layers", category: "Wardrobe", type: "Unisex · Look 03", meta: "Utility jacket", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", color: "#a33b2e", blurb: "Practical layers for movement and location work." },
  { id: "white", name: "Timeless White", category: "Wardrobe", type: "Aria · Look 04", meta: "Dream silhouette", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85", color: "#d4533f", blurb: "A period-feeling look for messages from another time." },
  { id: "lantern", name: "Antique Lantern", category: "Props", type: "Hero prop", meta: "Brass", image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=900&q=85", color: "#c23b2e", blurb: "The light source that can reveal hidden messages." },
  { id: "letter", name: "Hidden Letter", category: "Props", type: "Story clue", meta: "Aged paper", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85", color: "#8e241c", blurb: "A handwritten clue that can start the mystery." },
  { id: "key", name: "Brass Key", category: "Props", type: "Story clue", meta: "Weathered metal", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=85", color: "#a33b2e", blurb: "A small object that can unlock a location." },
  { id: "watch", name: "Stopped Watch", category: "Props", type: "Continuity prop", meta: "Frozen time", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85", color: "#d4533f", blurb: "A timepiece for stories where time has slipped." },
  { id: "cinematic", name: "Cinematic 35mm", category: "Camera", type: "Primary lens", meta: "Natural depth", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85", color: "#c23b2e", blurb: "A natural perspective for the main scene." },
  { id: "wide", name: "Wide 24mm", category: "Camera", type: "Establishing lens", meta: "World scale", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=85", color: "#8e241c", blurb: "A wide frame that shows the place first." },
  { id: "portrait", name: "Portrait 85mm", category: "Camera", type: "Close-up lens", meta: "Character", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=85", color: "#a33b2e", blurb: "A tight frame for faces and emotion." },
  { id: "macro", name: "Macro 100mm", category: "Camera", type: "Detail lens", meta: "Insert shots", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85", color: "#d4533f", blurb: "A close look at props, hands, and small clues." },
];

const categories: LibraryCategory[] = ["Worlds", "Characters", "Wardrobe", "Props", "Camera"];

const agents = [
  { name: "Story Director", detail: "Structures your narrative", active: true },
  { name: "World Curator", detail: "Finds the right modules", active: true },
  { name: "Shot Director", detail: "Plans every frame", active: true },
  { name: "Continuity", detail: "Keeps every detail consistent", active: false },
];

function timeAgo(value: string, now: number) {
  const minutes = Math.max(1, Math.round((now - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Dashboard({ userName }: { userName: string }) {
  const router = useRouter();
  const storyRef = useRef<HTMLTextAreaElement>(null);
  const [story, setStory] = useState("");
  const [section, setSection] = useState<StudioSection>("home");
  const [activeTab, setActiveTab] = useState<LibraryCategory>("Worlds");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<LibraryCard | null>(null);
  const [panel, setPanel] = useState<"notifications" | "invite" | "how" | null>(null);
  const [toast, setToast] = useState("");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsError, setProjectsError] = useState("");
  const [canSignOut, setCanSignOut] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const initials = userName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    let active = true;
    fetch("/api/projects", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { projects?: ProjectSummary[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Could not load projects.");
        if (active) setProjects(payload.projects ?? []);
      })
      .catch((error: unknown) => {
        if (active) setProjectsError(error instanceof Error ? error.message : "Could not load projects.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setTimeout(() => setCanSignOut(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const visibleCards = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return library.filter((card) => {
      const matchesSection = section === "marketplace" || section === "home" || section === "projects"
        ? section !== "home" && section !== "projects" || card.category === activeTab
        : card.category.toLowerCase() === section;
      const matchesQuery = !normalized || `${card.name} ${card.type} ${card.blurb}`.toLowerCase().includes(normalized);
      return matchesSection && matchesQuery;
    });
  }, [activeTab, query, section]);

  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((item) => !normalized || `${item.title} ${item.story}`.toLowerCase().includes(normalized));
  }, [projects, query]);

  function showSection(next: StudioSection, tab?: LibraryCategory) {
    setSection(next);
    setPanel(null);
    setSelected(null);
    if (tab) setActiveTab(tab);
    const target = next === "projects" ? "projects" : next === "home" ? "studio-top" : "library";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function focusStory(nextStory?: string) {
    if (nextStory) setStory(nextStory);
    setSection("home");
    setPanel(null);
    setSelected(null);
    document.getElementById("studio-top")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => storyRef.current?.focus(), 250);
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setToast("Studio link copied");
      setPanel(null);
    } catch {
      setToast("Copy the link from the invite panel");
    }
  }

  async function signOut() {
    if (!canSignOut) return;
    try {
      await authClient.signOut();
    } catch {
      setToast("Could not sign out. Try again.");
      return;
    }
    window.location.assign("/login");
  }

  async function createProject() {
    if (!story.trim() || isCreating) return;
    setCreateError("");
    setIsCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story }),
      });
      const payload = await response.json() as { projectId?: string; error?: string };
      if (!response.ok || !payload.projectId) {
        throw new Error(payload.error ?? "We could not create your project.");
      }
      router.push(`/projects/${payload.projectId}`);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "We could not create your project.");
      setIsCreating(false);
    }
  }

  const nav = [
    { id: "home" as const, label: "Home", icon: "home" as const },
    { id: "create" as const, label: "Create", icon: "sparkles" as const },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => showSection("home")} type="button">
          <span className="brand-mark"><Icon name="sparkles" size={20} /></span>
          <span>PREVIEWS</span>
        </button>
        <nav className="primary-nav" aria-label="Main navigation">
          {nav.map((item) => (
            <button className={`nav-item ${section === "home" && item.id === "home" ? "active" : ""}`} key={item.id} onClick={() => item.id === "create" ? focusStory() : showSection("home")} type="button">
              <Icon name={item.icon} /> {item.label}
            </button>
          ))}
          <p className="nav-label">Your library</p>
          {categories.map((category) => (
            <button className={`nav-item ${section === category.toLowerCase() ? "active" : ""}`} key={category} onClick={() => showSection(category.toLowerCase() as StudioSection, category)} type="button">
              <Icon name={category === "Worlds" ? "globe" : category === "Characters" ? "users" : category === "Wardrobe" ? "shirt" : category === "Camera" ? "camera" : "box"} />
              {category}
              <span className="nav-count">{library.filter((card) => card.category === category).length}</span>
            </button>
          ))}
          <button className={`nav-item ${section === "projects" ? "active" : ""}`} onClick={() => showSection("projects")} type="button">
            <Icon name="film" /> Projects <span className="nav-count">{projects.length}</span>
          </button>
          <p className="nav-label">Discover</p>
          <button className={`nav-item ${section === "marketplace" ? "active" : ""}`} onClick={() => showSection("marketplace")} type="button">
            <Icon name="store" /> Marketplace
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="usage">
            <div className="usage-row"><span>Studio credits</span><strong>72%</strong></div>
            <div className="usage-track"><span /></div>
            <small>1,440 of 2,000 remaining</small>
          </div>
          <div className="profile-card">
            <span className="avatar">{initials}</span>
            <span><strong>{userName}</strong><small>Free studio</small></span>
          </div>
          <button className="sign-out-button" disabled={!canSignOut} onClick={signOut} type="button">Sign out</button>
        </div>
      </aside>

      <main className="main-content" id="studio-top">
        <header className="topbar">
          <button className="mobile-brand" onClick={() => showSection("home")} type="button">PREVIEWS</button>
          <label className="search-box">
            <Icon name="search" size={17} />
            <input aria-label="Search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search modules and projects" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications" aria-expanded={panel === "notifications"} onClick={() => setPanel(panel === "notifications" ? null : "notifications")} type="button"><Icon name="bell" /></button>
            <button className="invite-button" aria-expanded={panel === "invite"} onClick={() => setPanel(panel === "invite" ? null : "invite")} type="button"><Icon name="plus" size={16} /> Invite</button>
            {panel === "notifications" && (
              <div className="action-pop">
                <strong>Notifications</strong>
                <p>Your four production agents are online.</p>
                <p>{projects.length === 1 ? "1 project saved in this studio." : `${projects.length} projects saved in this studio.`}</p>
              </div>
            )}
            {panel === "invite" && (
              <div className="action-pop">
                <strong>Invite a teammate</strong>
                <p>Share this studio link.</p>
                <button onClick={copyInvite} type="button">Copy link</button>
              </div>
            )}
          </div>
        </header>

        <div className="page">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">SATURDAY, OCTOBER 24</p>
              <h1>Turn your story into a world.</h1>
              <p className="subtitle">Bring the words. Your AI production team handles the rest.</p>
            </div>
            <button className="how-button" onClick={() => setPanel("how")} type="button"><span><Icon name="play" size={14} /></span> How it works</button>
          </section>

          <section className="creator-panel" id="create">
            <div className="creator-main">
              <div className="creator-title">
                <span className="creator-icon"><Icon name="sparkles" size={19} /></span>
                <div><h2>What story do you want to tell?</h2><p>Start with a scene, a feeling, or the whole plot.</p></div>
              </div>
              <textarea ref={storyRef} value={story} onChange={(event) => setStory(event.target.value)}
                placeholder="A young architect discovers that the impossible house she keeps dreaming about is real..."
                maxLength={2000} />
              <div className="composer-footer">
                <span className="character-count">
                  {createError || `${story.length} / 2,000`}
                </span>
                <button className="create-button" disabled={!story.trim() || isCreating} onClick={createProject} type="button">
                  {isCreating ? "Opening studio..." : "Build my world"} <Icon name="arrow" size={17} />
                </button>
              </div>
            </div>
            <div className="agent-panel">
              <div className="agent-heading"><span>Your production team</span><span className="online"><i /> Online</span></div>
              <div className="agent-list">
                {agents.map((agent, index) => (
                  <div className="agent" key={agent.name}>
                    <span className={`agent-avatar agent-${index + 1}`}>{["SD", "WC", "SH", "CS"][index]}</span>
                    <span className="agent-copy"><strong>{agent.name}</strong><small>{agent.detail}</small></span>
                    <span className={agent.active ? "agent-dot active" : "agent-dot"} />
                  </div>
                ))}
              </div>
              <p className="agent-note"><Icon name="sparkles" size={13} /> Powered by AgenticOrg</p>
            </div>
          </section>

          {section !== "projects" && (
            <section className="module-section" id="library">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{section === "marketplace" ? "MARKETPLACE" : "BUILDING BLOCKS"}</p>
                  <h2>{section === "marketplace" ? "Every module in PREVIEWS" : `Explore ${activeTab.toLowerCase()}`}</h2>
                </div>
                <button className="view-button" onClick={() => showSection("marketplace")} type="button">View marketplace <Icon name="arrow" size={16} /></button>
              </div>
              {section !== "marketplace" && (
                <div className="tabs" role="tablist" aria-label="Library categories">
                  {categories.map((tab) => (
                    <button key={tab} role="tab" aria-selected={activeTab === tab}
                      className={activeTab === tab ? "active" : ""} onClick={() => showSection(tab.toLowerCase() as StudioSection, tab)} type="button">
                      {tab}
                    </button>
                  ))}
                </div>
              )}
              <div className="world-grid">
                {visibleCards.map((card, index) => (
                  <article className="world-card" key={card.id}>
                    <button className="world-open" onClick={() => setSelected(card)} type="button">
                      <span className="world-image" style={{ backgroundImage: `linear-gradient(180deg, transparent 45%, rgba(7, 8, 9, .76)), url("${card.image}")` }}>
                        {index === 0 && <span className="featured-badge">Featured</span>}
                        <span className="world-overlay"><span className="card-kicker">{card.type}</span><span className="card-name">{card.name}</span></span>
                      </span>
                    </button>
                    <div className="world-meta">
                      <span><i style={{ background: card.color }} /> {card.meta}</span>
                      <div className="card-actions">
                        <button aria-label={`Save ${card.name}`} className={`heart-button inline ${saved.includes(card.id) ? "saved" : ""}`} onClick={() => setSaved((current) => current.includes(card.id) ? current.filter((id) => id !== card.id) : [...current, card.id])} type="button"><Icon name="heart" size={17} /></button>
                        <button aria-label={`Open ${card.name}`} onClick={() => setSelected(card)} type="button"><Icon name="chevron" size={17} /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {visibleCards.length === 0 && <p className="empty-note">No modules match “{query}”.</p>}
            </section>
          )}

          <section className="recent-section" id="projects">
            <div className="section-heading compact">
              <div><p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p><h2>{section === "projects" ? "All projects" : "Recent projects"}</h2></div>
              <button className="text-button" onClick={() => showSection("projects")} type="button">View all</button>
            </div>
            {projectsError && <p className="empty-note">{projectsError}</p>}
            {(section === "projects" ? visibleProjects : visibleProjects.slice(0, 3)).map((item) => (
              <div className="recent-card" key={item.id}>
                <button className="recent-thumbnail" onClick={() => router.push(`/projects/${item.id}`)} type="button"><span><Icon name="play" size={18} /></span></button>
                <div className="recent-copy"><span className="draft-badge">{item.status}</span><h3>{item.title}</h3><p>{item.story.slice(0, 90)}</p></div>
                <span className="edited"><Icon name="clock" size={14} /> {now ? `Edited ${timeAgo(item.updatedAt, now)}` : "Saved"}</span>
                <button className="continue-button" onClick={() => router.push(`/projects/${item.id}`)} type="button">Continue <Icon name="arrow" size={15} /></button>
              </div>
            ))}
            {!projectsError && visibleProjects.length === 0 && (query.trim() ? (
              <p className="empty-note">No projects match “{query.trim()}”.</p>
            ) : (
              <div className="recent-card">
                <div className="recent-copy"><h3>No projects yet</h3><p>Write a story and your production team will build the first one.</p></div>
                <button className="continue-button" onClick={() => focusStory()} type="button">Start writing <Icon name="arrow" size={15} /></button>
              </div>
            ))}
          </section>
        </div>
        {selected && (
          <div className="sheet-backdrop" onClick={() => setSelected(null)}>
            <section className="module-sheet" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="module-title">
              <div className="sheet-image" style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(20,10,8,.72)), url("${selected.image}")` }} />
              <div>
                <p className="eyebrow">{selected.category}</p>
                <h2 id="module-title">{selected.name}</h2>
                <p>{selected.blurb}</p>
                <div className="sheet-actions">
                  <button onClick={() => focusStory(`A story using ${selected.name}. ${selected.blurb}`)} type="button">Use in a story</button>
                  <button onClick={() => setSelected(null)} type="button">Close</button>
                </div>
              </div>
            </section>
          </div>
        )}
        {panel === "how" && (
          <div className="sheet-backdrop" onClick={() => setPanel(null)}>
            <section className="how-dialog" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="how-title">
              <p className="eyebrow">HOW PREVIEWS WORKS</p>
              <h2 id="how-title">Four steps, one story.</h2>
              <ol>
                <li>Write the story in your own words.</li>
                <li>The agents turn it into scenes, worlds, shots, and a continuity check.</li>
                <li>Choose characters, locations, outfits, props, camera, and lighting.</li>
                <li>Lock the package and keep the production blueprint.</li>
              </ol>
              <button onClick={() => focusStory()} type="button">Start a story</button>
            </section>
          </div>
        )}
        {toast && <p className="studio-toast" role="status">{toast}</p>}
      </main>
    </div>
  );
}
