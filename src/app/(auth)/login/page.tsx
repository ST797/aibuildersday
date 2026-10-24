import type { Metadata } from "next";
import { listPeople, type StudioPeople } from "@/lib/people-count";
import AuthForm from "../auth-form";
import AuthShell from "../auth-shell";

export const metadata: Metadata = {
  title: "Sign in — PREVIEWS",
};

export const instant = false;

export default async function LoginPage() {
  let people: StudioPeople | null = null;
  try {
    people = await listPeople();
  } catch {
    people = null;
  }

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Your worlds are waiting."
      description="Sign in to continue building stories with your AI production team."
      people={people}
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
