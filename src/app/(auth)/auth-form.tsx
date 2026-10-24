"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "login" | "signup";
};

function ArrowIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = isSignup
        ? await authClient.signUp.email({
            name: name.trim(),
            email: email.trim(),
            password,
            callbackURL: "/studio",
          })
        : await authClient.signIn.email({
            email: email.trim(),
            password,
            callbackURL: "/studio",
          });

      if (result.error) {
        setError(result.error.message ?? "We could not complete that request.");
        return;
      }

      router.push("/studio");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {isSignup && (
        <label className="field">
          <span>Name</span>
          <input
            autoComplete="name"
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
            type="text"
            value={name}
          />
        </label>
      )}

      <label className="field">
        <span>Email address</span>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <span className="password-input">
          <input
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isSignup ? "At least 8 characters" : "Enter your password"}
            required
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </span>
      </label>

      {!isSignup && (
        <div className="form-options">
          <label className="remember"><input type="checkbox" /> <span>Keep me signed in</span></label>
          <button className="forgot-link" type="button" title="Password reset is coming next">
            Forgot password?
          </button>
        </div>
      )}

      {error && <p className="auth-error" role="alert">{error}</p>}

      <button className="auth-submit" disabled={isSubmitting} type="submit">
        <span>{isSubmitting ? "Please wait..." : isSignup ? "Create my studio" : "Enter your studio"}</span>
        {!isSubmitting && <ArrowIcon />}
      </button>

      {isSignup && (
        <p className="terms">
          By creating an account, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      )}

      <p className="auth-switch">
        {isSignup ? "Already have an account?" : "New to PREVIEWS?"}{" "}
        <Link href={isSignup ? "/login" : "/signup"}>
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
