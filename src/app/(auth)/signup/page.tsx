import type { Metadata } from "next";
import { listPeople, type StudioPeople } from "@/lib/people-count";
import AuthForm from "../auth-form";
import AuthShell from "../auth-shell";

export const metadata: Metadata = {
  title: "Create your studio — PREVIEWS",
};

export const instant = false;

export default async function SignupPage() {
  let people: StudioPeople | null = null;
  try {
    people = await listPeople();
  } catch {
    people = null;
  }

  return (
    <AuthShell
      eyebrow="START CREATING"
      title="Build your first world."
      description="Create a studio and turn the story in your head into a production-ready universe."
      people={people}
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
