"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function IconMail({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconLock({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconUser({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconGoogle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Supabase sends confirmation email; show success state
    setSuccess(true);
    setLoading(false);
  }

  async function handleOAuthSignUp() {
    setError(null);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  }

  if (success) {
    return (
      <main className="min-h-screen bg-sv-base flex items-center justify-center px-[var(--sv-margin)]">
        <div className="w-full max-w-[400px] sv-card p-[var(--sv-space-lg)] text-center flex flex-col gap-[var(--sv-space-md)]">
          <div className="w-12 h-12 rounded-full bg-sv-accent/10 border border-sv-accent/30 flex items-center justify-center mx-auto">
            <IconMail className="w-5 h-5 text-sv-accent" />
          </div>
          <div>
            <h2 className="text-headline-sm text-sv-text-bright">Check your email</h2>
            <p className="text-sm text-sv-text-muted mt-1">
              We sent a confirmation link to <span className="text-sv-text-primary">{email}</span>
            </p>
          </div>
          <p className="text-label-caps-sm text-sv-text-muted">
            Click the link to activate your account, then sign in.
          </p>
          <Link
            href="/auth/sign-in"
            className="text-sv-accent text-sm hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sv-base flex items-center justify-center px-[var(--sv-margin)]">
      <div className="w-full max-w-[400px] flex flex-col gap-[var(--sv-space-lg)]">

        {/* Brand */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-[var(--sv-space-md)]">
            <div className="w-2 h-2 rounded-full bg-sv-accent" />
            <span className="text-label-caps-md text-sv-accent tracking-widest">SMART VEHICLE</span>
          </div>
          <h1 className="text-headline-md text-sv-text-bright">Create Account</h1>
          <p className="text-sm text-sv-text-muted mt-1">Register and protect your vehicle</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="sv-card p-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-md)]">

          {error && (
            <div className="bg-sv-accent-deep/20 border border-sv-accent-deep rounded-[var(--sv-radius-sm)] px-[var(--sv-space-md)] py-[var(--sv-space-sm)]">
              <p className="text-sm text-sv-accent">{error}</p>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-label-caps-sm text-sv-text-muted">Full Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sv-text-muted pointer-events-none">
                <IconUser />
              </div>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arjun Sharma"
                className="w-full h-11 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] pl-9 pr-3 text-sv-text-primary text-sm placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-label-caps-sm text-sv-text-muted">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sv-text-muted pointer-events-none">
                <IconMail />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] pl-9 pr-3 text-sv-text-primary text-sm placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-label-caps-sm text-sv-text-muted">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sv-text-muted pointer-events-none">
                <IconLock />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] pl-9 pr-3 text-sv-text-primary text-sm placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors"
              />
            </div>
          </div>

          <button
            id="btn-sign-up"
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-sv-accent text-sv-base rounded-[var(--sv-radius-sm)] font-semibold text-sm hover:bg-sv-accent-hover active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-sv-border" />
            <span className="text-label-caps-sm text-sv-text-muted">OR</span>
            <div className="flex-1 h-px bg-sv-border" />
          </div>

          <button
            type="button"
            onClick={handleOAuthSignUp}
            className="w-full h-11 bg-sv-surface border border-sv-border text-sv-text-bright rounded-[var(--sv-radius-sm)] font-medium text-sm flex items-center justify-center gap-2 hover:bg-sv-surface-high active:scale-[0.98] transition-all cursor-pointer"
          >
            <IconGoogle className="w-5 h-5" />
            Sign up with Google
          </button>
        </form>

        <p className="text-center text-sm text-sv-text-muted">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-sv-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
