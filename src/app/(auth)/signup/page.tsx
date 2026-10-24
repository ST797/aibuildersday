import type { Metadata } from "next";
import AuthForm from "../auth-form";
import AuthShell from "../auth-shell";

export const metadata: Metadata = {
  title: "Create your studio — PREVIEWS",
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="START CREATING"
      title="Build your first world."
      description="Create a studio and turn the story in your head into a production-ready universe."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
