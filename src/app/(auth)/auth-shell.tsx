import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
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

export default function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-overlay" />
        <Link className="auth-brand light" href="/login">
          <span><Sparkles /></span>
          PREVIEWS
        </Link>
        <div className="visual-copy">
          <span className="visual-pill">AI production studio</span>
          <blockquote>“Every great world begins with a single sentence.”</blockquote>
          <p>Write the story. Meet your crew. Build something unforgettable.</p>
        </div>
        <div className="visual-agents">
          <div className="agent-stack"><i>SD</i><i>WC</i><i>SH</i><i>CS</i></div>
          <span><strong>4 specialist agents</strong><small>ready to build with you</small></span>
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
          {children}
        </div>
        <p className="auth-footer">© 2026 PREVIEWS · Built with AgenticOrg</p>
      </section>
    </main>
  );
}
