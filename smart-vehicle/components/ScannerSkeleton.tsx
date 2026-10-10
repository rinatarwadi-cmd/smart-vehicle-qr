/**
 * Skeleton Loader for the QR Scanner page.
 *
 * Matches the exact layout structure of the loaded page so the
 * user sees a structurally consistent placeholder — no blank flash,
 * no generic spinner. Uses Apex Cockpit shimmer animation from globals.css.
 */
export function ScannerSkeleton() {
  return (
    <main className="flex-1 flex flex-col min-h-screen bg-sv-base">
      <div className="w-full max-w-[430px] mx-auto px-[var(--sv-margin)] py-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-lg)]">

        {/* ── Status bar skeleton ── */}
        <div className="flex items-center justify-between">
          <div className="sv-skeleton h-3 w-40 rounded" />
          <div className="sv-skeleton h-3 w-16 rounded" />
        </div>

        {/* ── Vehicle info card skeleton ── */}
        <div className="sv-card p-[var(--sv-space-md)]">
          <div className="flex items-start gap-3">
            {/* Accent bar */}
            <div className="w-1 h-14 rounded-full bg-sv-border shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="sv-skeleton h-4 w-36 rounded" />
              <div className="sv-skeleton h-3 w-48 rounded" />
              <div className="sv-skeleton h-3 w-24 rounded" />
            </div>
          </div>
        </div>

        {/* ── Hero CTA skeleton ── */}
        <div>
          <div className="sv-skeleton h-14 w-full rounded-[var(--sv-radius-md)]" />
          <div className="sv-skeleton h-3 w-44 mx-auto mt-2 rounded" />
        </div>

        {/* ── Action list skeleton ── */}
        <div className="sv-card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-[var(--sv-space-md)] py-3 ${
                i < 4 ? "border-b border-sv-border" : ""
              }`}
              style={{ minHeight: "56px" }}
            >
              {/* Icon badge */}
              <div className="sv-skeleton w-8 h-8 rounded-full shrink-0" />
              {/* Text lines */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="sv-skeleton h-3.5 w-28 rounded" />
                <div className="sv-skeleton h-2.5 w-40 rounded" />
              </div>
              {/* Chevron */}
              <div className="sv-skeleton w-4 h-4 rounded shrink-0" />
            </div>
          ))}
        </div>

        {/* ── Security badge skeleton ── */}
        <div className="sv-card px-[var(--sv-space-md)] py-3 flex items-center gap-2">
          <div className="sv-skeleton w-4 h-4 rounded shrink-0" />
          <div className="sv-skeleton h-3 w-52 rounded" />
        </div>

        {/* ── Footer skeleton ── */}
        <div className="text-center pt-[var(--sv-space-sm)] pb-[var(--sv-space-lg)]">
          <div className="sv-skeleton h-2.5 w-36 mx-auto rounded" />
        </div>
      </div>
    </main>
  );
}
