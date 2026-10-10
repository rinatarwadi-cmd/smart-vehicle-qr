/**
 * Empty/error state screens for invalid token scenarios.
 * Each maps to a specific TokenResolveResult status.
 */

interface EmptyStateProps {
  type: "not_found" | "expired" | "inactive" | "error";
}

const STATES = {
  not_found: {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M11 8v4" />
        <path d="M11 16h.01" />
      </svg>
    ),
    title: "QR Code Not Found",
    subtitle: "This QR tag doesn't match any registered vehicle. It may have been removed by the owner.",
    label: "UNREGISTERED TAG",
  },
  expired: {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "QR Code Expired",
    subtitle: "This tag has expired and is no longer active. Please contact the vehicle owner through another channel.",
    label: "TAG EXPIRED",
  },
  inactive: {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Tag Deactivated",
    subtitle: "The vehicle owner has deactivated this QR tag. It is no longer accepting contact requests.",
    label: "TAG INACTIVE",
  },
  error: {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "Something Went Wrong",
    subtitle: "We couldn't process this QR tag right now. Please try again in a moment.",
    label: "SERVICE ERROR",
  },
} as const;

export function ScannerEmptyState({ type }: EmptyStateProps) {
  const state = STATES[type];

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-sv-base">
      <div className="w-full max-w-[430px] mx-auto px-[var(--sv-margin)] flex-1 flex flex-col items-center justify-center gap-[var(--sv-space-lg)] text-center">
        {/* Icon */}
        <div className="text-sv-text-muted opacity-60">{state.icon}</div>

        {/* Label */}
        <p className="text-label-caps-md text-sv-text-muted">{state.label}</p>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-sm text-sv-text-primary">{state.title}</h1>
          <p className="text-sm text-sv-text-muted leading-relaxed max-w-xs mx-auto">
            {state.subtitle}
          </p>
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-sv-border" />

        {/* Brand reassurance */}
        <p className="text-label-caps-sm text-sv-text-muted">
          Powered by Smart Vehicle
        </p>
      </div>
    </main>
  );
}
