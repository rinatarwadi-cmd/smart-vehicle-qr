import Link from "next/link";

export const metadata = {
  title: "Smart Vehicle — Private QR Contact for Your Car",
  description:
    "Scan a QR tag on any vehicle to instantly and privately contact the owner. No phone numbers shared. Masked calls. Instant alerts.",
};

/* ── Inline Icons (server component — no imports needed) ───── */

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-sv-accent shrink-0">
      <rect x="2" y="6" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 20V12L12 16L16 12L20 16L24 12V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="11" r="1.5" fill="currentColor" />
      <circle cx="24" cy="11" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconPhone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconShield({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconLock({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconBell({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconEyeOff({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

function IconUserPlus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function IconPrinter({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function IconZap({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Feature & Step data ──────────────────────────────────────── */

const FEATURES = [
  {
    icon: IconPhone,
    title: "Masked Calling",
    desc: "Direct voice calls to the owner without revealing either phone number. Twilio-powered bridge ensures total privacy for both parties.",
  },
  {
    icon: IconBell,
    title: "Instant Alerts",
    desc: "Parking blocks, lights left on, vehicle issues — one tap sends an SMS to the owner immediately. No app download required.",
  },
  {
    icon: IconEyeOff,
    title: "Privacy First",
    desc: "No personal data exposed to scanners. QR tokens are opaque and revocable. The owner controls everything from their dashboard.",
  },
];

const STEPS = [
  {
    icon: IconUserPlus,
    title: "Register Your Vehicle",
    desc: "Add your car, plate number, and contact info. Takes 30 seconds. Your number is encrypted immediately.",
  },
  {
    icon: IconPrinter,
    title: "Print & Place QR Tag",
    desc: "Generate your unique QR tag and print the windshield-ready card. Place it where it's visible from outside.",
  },
  {
    icon: IconZap,
    title: "Get Notified Instantly",
    desc: "When someone scans your tag, you receive a call or SMS alert. No numbers shared. You stay in control.",
  },
];

/* ── Page Component ───────────────────────────────────────────── */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-sv-base overflow-hidden">

      {/* ════════════════════════════════════════════════════════
         NAV BAR
         ════════════════════════════════════════════════════════ */}
      <nav className="w-full max-w-[960px] mx-auto px-[var(--sv-margin)] py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-label-caps-md text-sv-accent tracking-widest">SMART VEHICLE</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/sign-in"
            className="text-sm text-sv-text-muted hover:text-sv-text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="hidden sm:inline-flex items-center h-9 px-4 text-sm font-semibold bg-sv-accent text-sv-base rounded-[var(--sv-radius-sm)] hover:bg-sv-accent-hover transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
         HERO
         ════════════════════════════════════════════════════════ */}
      <section className="relative pt-10 sm:pt-16 pb-20">
        {/* Ambient glow */}
        <div className="sv-hero-glow" aria-hidden="true" />

        <div className="w-full max-w-[960px] mx-auto px-[var(--sv-margin)] relative z-10 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-12 md:gap-16 items-center">

          {/* ── Left column: copy ── */}
          <div className="text-center md:text-left">
            <h1 className="text-display-hero text-sv-text-bright leading-[1.1]">
              Your Vehicle.
              <br />
              <span className="text-sv-accent">Always Reachable.</span>
              <br />
              Always Private.
            </h1>

            <p className="text-lg text-sv-text-muted mt-6 max-w-md leading-relaxed mx-auto md:mx-0">
              A QR tag on your windshield lets anyone contact you instantly
              — without ever seeing your phone number.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center gap-2 h-13 px-7 bg-sv-accent text-sv-base font-semibold text-base rounded-[var(--sv-radius-md)] hover:bg-sv-accent-hover active:scale-[0.98] transition-all"
              >
                Get Started Free
                <IconArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center h-13 px-6 border border-sv-border text-sv-text-primary text-base rounded-[var(--sv-radius-md)] hover:border-sv-accent hover:text-sv-accent transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Trust line */}
            <div className="flex items-center justify-center md:justify-start gap-2 mt-6">
              <IconShield className="w-3.5 h-3.5 text-sv-status-ok" />
              <span className="text-label-caps-sm text-sv-text-muted">
                Free · No Credit Card · Privacy Protected
              </span>
            </div>
          </div>

          {/* ── Right column: scanner preview ── */}
          <div className="relative mx-auto w-full max-w-[300px] md:max-w-none">
            {/* Outer glow ring */}
            <div
              className="absolute -inset-4 rounded-[20px] opacity-30"
              style={{
                background: "radial-gradient(ellipse at center, rgba(212,160,23,0.2) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />

            {/* Scanner preview card */}
            <div className="sv-card overflow-hidden relative">
              {/* Animated scan line */}
              <div className="sv-scan-line" />

              <div className="p-[var(--sv-space-md)]">
                {/* Status bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="sv-pulse-dot" aria-hidden="true" />
                    <span className="text-label-caps-md text-sv-text-muted">
                      Connected to vehicle
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sv-text-muted">
                    <IconLock className="w-2.5 h-2.5" />
                    <span className="text-label-caps-sm">Masked</span>
                  </div>
                </div>

                {/* Vehicle info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-1 self-stretch rounded-full bg-sv-accent shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-label-caps-lg text-sv-text-bright tracking-[0.12em]">
                      KA-01-AB-1234
                    </p>
                    <p className="text-sm text-sv-text-muted mt-1">
                      Apex GT · Stealth Black
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <IconLock className="w-2.5 h-2.5 text-sv-text-muted" />
                      <span className="text-label-caps-sm text-sv-text-muted">
                        Identity Masked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hero CTA */}
                <div className="w-full h-11 rounded-[var(--sv-radius-md)] bg-sv-accent flex items-center justify-center gap-2">
                  <IconPhone className="w-4 h-4 text-sv-base" />
                  <span className="text-sv-base font-semibold text-sm">Call Owner</span>
                </div>

                {/* Mini action hints */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    "Parking Alert",
                    "Lights On",
                    "Send Message",
                    "Vehicle Issue",
                  ].map((label) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 bg-sv-surface-high rounded-[var(--sv-radius-sm)] px-2.5 py-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-sv-accent-subtle flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-sv-accent" />
                      </div>
                      <span className="text-[11px] text-sv-text-muted">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <IconShield className="w-3.5 h-3.5 text-sv-status-ok" />
                  <span className="text-label-caps-sm text-sv-text-muted">
                    End-to-End Encrypted · No Numbers Shared
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FEATURES
         ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 border-t border-sv-border">
        <div className="w-full max-w-[960px] mx-auto px-[var(--sv-margin)]">
          <p className="text-label-caps-md text-sv-accent text-center tracking-widest">
            Why Smart Vehicle
          </p>
          <h2 className="text-headline-lg text-sv-text-bright text-center mt-3">
            Contact without compromise
          </h2>
          <p className="text-base text-sv-text-muted text-center mt-2 max-w-md mx-auto">
            Every interaction is private, instant, and under the vehicle owner&apos;s control.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="sv-card sv-feature-card p-[var(--sv-space-lg)]"
                >
                  <div className="w-11 h-11 rounded-full bg-sv-accent-subtle flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-sv-accent" />
                  </div>
                  <h3 className="text-headline-sm text-sv-text-bright">
                    {f.title}
                  </h3>
                  <p className="text-sm text-sv-text-muted mt-2 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         HOW IT WORKS
         ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 border-t border-sv-border">
        <div className="w-full max-w-[960px] mx-auto px-[var(--sv-margin)]">
          <p className="text-label-caps-md text-sv-accent text-center tracking-widest">
            How It Works
          </p>
          <h2 className="text-headline-lg text-sv-text-bright text-center mt-3">
            Three steps to peace of mind
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 mt-12">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="flex flex-col items-center text-center">
                  {/* Step number */}
                  <div className="sv-step-number">{i + 1}</div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-[var(--sv-radius-md)] bg-sv-surface border border-sv-border flex items-center justify-center mt-5">
                    <Icon className="w-5 h-5 text-sv-accent" />
                  </div>

                  <h3 className="text-headline-sm text-sv-text-bright mt-4">
                    {s.title}
                  </h3>
                  <p className="text-sm text-sv-text-muted mt-2 leading-relaxed max-w-[260px]">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         STATS / TRUST BAR
         ════════════════════════════════════════════════════════ */}
      <section className="py-12 border-t border-sv-border">
        <div className="w-full max-w-[720px] mx-auto px-[var(--sv-margin)] grid grid-cols-3 gap-4">
          {[
            { value: "0 ms", label: "Number Exposure" },
            { value: "100%", label: "Privacy Rate" },
            { value: "< 3s", label: "Alert Delivery" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-headline-md text-sv-accent">{stat.value}</p>
              <p className="text-label-caps-sm text-sv-text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FINAL CTA
         ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="w-full max-w-[600px] mx-auto px-[var(--sv-margin)]">
          <div className="sv-card p-8 sm:p-10 text-center" style={{ borderColor: "rgba(212,160,23,0.25)" }}>
            <div className="w-14 h-14 rounded-full bg-sv-accent-subtle flex items-center justify-center mx-auto mb-5">
              <IconShield className="w-6 h-6 text-sv-accent" />
            </div>
            <h2 className="text-headline-md text-sv-text-bright">
              Ready to protect your vehicle?
            </h2>
            <p className="text-base text-sv-text-muted mt-2 max-w-sm mx-auto">
              Register in 30 seconds. Print your QR tag. Start receiving
              anonymous alerts instantly.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 h-13 px-8 bg-sv-accent text-sv-base font-semibold text-base rounded-[var(--sv-radius-md)] hover:bg-sv-accent-hover active:scale-[0.98] transition-all mt-7"
            >
              Get Started Free
              <IconArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-label-caps-sm text-sv-text-muted mt-4">
              Free Forever · No Credit Card Required
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FOOTER
         ════════════════════════════════════════════════════════ */}
      <footer className="py-8 border-t border-sv-border">
        <div className="w-full max-w-[960px] mx-auto px-[var(--sv-margin)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="text-label-caps-sm text-sv-text-muted">
              Smart Vehicle
            </span>
          </div>
          <p className="text-label-caps-sm text-sv-text-muted">
            © {new Date().getFullYear()} Smart Vehicle. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
