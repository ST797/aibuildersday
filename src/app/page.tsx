import AuthForm from "./(auth)/auth-form";
import AuthShell from "./(auth)/auth-shell";

export default function Home() {
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
