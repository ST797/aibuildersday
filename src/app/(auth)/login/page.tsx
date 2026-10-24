import type { Metadata } from "next";
import AuthForm from "../auth-form";
import AuthShell from "../auth-shell";

export const metadata: Metadata = {
  title: "Sign in — PREVIEWS",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Your worlds are waiting."
      description="Sign in to continue building stories with your AI production team."
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
