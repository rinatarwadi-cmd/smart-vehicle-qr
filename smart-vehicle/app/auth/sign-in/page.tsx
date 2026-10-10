"use client";

import { useState, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // Ensures cookies work over LAN IPs on HTTP
        secure: typeof window !== "undefined" ? window.location.protocol === "https:" : false,
      }
    }
  );
}

function IconLock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconMail({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
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

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Hard navigate so middleware runs and refreshes the auth session
    window.location.href = next;
  }

  async function handleOAuthSignIn() {
    setError(null);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
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
          <h1 className="text-headline-md text-sv-text-bright">Owner Sign In</h1>
          <p className="text-sm text-sv-text-muted mt-1">Access your vehicle dashboard</p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSignIn} className="sv-card p-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-md)]">
          
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-label-caps-sm text-sv-text-muted">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sv-text-muted pointer-events-none">
                <IconMail className="w-4 h-4" />
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
                <IconLock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] pl-9 pr-3 text-sv-text-primary text-sm placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors"
              />
            </div>
          </div>

          {/* Error Badge */}
          {error && (
            <div className="bg-sv-danger-subtle border border-sv-danger rounded-[var(--sv-radius-sm)] px-[var(--sv-space-md)] py-[var(--sv-space-sm)]">
              <p className="text-sm text-sv-danger font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-sign-in"
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-sv-accent text-sv-base rounded-[var(--sv-radius-sm)] font-semibold text-sm hover:bg-sv-accent-hover active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
          
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-sv-border" />
            <span className="text-label-caps-sm text-sv-text-muted">OR</span>
            <div className="flex-1 h-px bg-sv-border" />
          </div>

          <button
            type="button"
            onClick={handleOAuthSignIn}
            className="w-full h-11 bg-sv-surface border border-sv-border text-sv-text-bright rounded-[var(--sv-radius-sm)] font-medium text-sm flex items-center justify-center gap-2 hover:bg-sv-surface-high active:scale-[0.98] transition-all cursor-pointer"
          >
            <IconGoogle className="w-5 h-5" />
            Sign in with Google
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm text-sv-text-muted">
          No account?{" "}
          <Link href="/auth/sign-up" className="text-sv-accent hover:underline">
            Register your vehicle
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-sv-base flex items-center justify-center">
        <div className="sv-skeleton w-16 h-16 rounded-full" />
      </main>
    }>
      <SignInForm />
    </Suspense>
  );
}
