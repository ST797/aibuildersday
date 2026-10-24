import Link from "next/link";
import type { ReactNode } from "react";
import type { StudioPeople } from "@/lib/people-count";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  people?: StudioPeople | null;
  children: ReactNode;
};

function Sparkles() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.2 3.4L7.5 8l3.3 1.5L12 13l1.2-3.5L16.5 8l-3.3-1.6L12 3Z" />
      <path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 13l-.7 1.8-1.8.7 1.8.7L19 18l.7-1.8 1.8-.7L19 13Z" />
    </svg>
  );
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] ?? name).slice(0, 2).toUpperCase();
}

function PeopleCast({ people, compact = false }: { people: StudioPeople; compact?: boolean }) {
  if (people.total === 0) {
    return <p className="people-empty">Be the first person here.</p>;
  }

  const extra = Math.max(0, people.total - people.names.length);
  return (
    <div className={`people-cast ${compact ? "compact" : ""}`}>
      <div className="people-letters" aria-hidden="true">
        {people.names.map((name, index) => (
          <span key={`${name}-${index}`}>{initials(name)}</span>
        ))}
        {extra > 0 && <span className="more">+{extra}</span>}
      </div>
      <p>
        <strong>{people.total}</strong>
        <span>{people.total === 1 ? "person here" : "people here"}</span>
      </p>
    </div>
  );
}

export default function AuthShell({ eyebrow, title, description, people = null, children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="visual-top">
          <Link className="auth-brand light" href="/login">
            <span><Sparkles /></span>
            PREVIEWS
          </Link>
          {people && <PeopleCast people={people} />}
        </div>
        <div className="visual-copy">
          <span className="visual-pill">AI production studio</span>
          <blockquote>“Every great world begins with a single sentence.”</blockquote>
          <p>Write the story. Meet your crew. Build something unforgettable.</p>
        </div>
      </section>

      <section className="auth-content">
        <Link className="auth-brand dark" href="/login">
          <span><Sparkles /></span>
          PREVIEWS
        </Link>
        <div className="auth-card">
          <p className="auth-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="auth-description">{description}</p>
          {people && <PeopleCast people={people} compact />}
          {children}
        </div>
        <p className="auth-footer">© 2026 PREVIEWS · Built with AgenticOrg</p>
      </section>
    </main>
  );
}
