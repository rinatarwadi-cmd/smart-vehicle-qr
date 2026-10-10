"use client";

import { useState } from "react";
import type { VehiclePublicData } from "@/lib/vehicle/resolveToken";

/* ============================================================
   Icons
   ============================================================ */

function IconPhone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconParking({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 3H6v18h3v-7h4a5 5 0 0 0 0-10zm0 7H9V6h4a2 2 0 1 1 0 4z" />
    </svg>
  );
}

function IconLightbulb({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

function IconMessage({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconWarning({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconChevronRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
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

/* ============================================================
   Call State Machine
   ready → connecting → connected | failed | rate_limited
   ============================================================ */

type CallState =
  | { phase: "ready" }
  | { phase: "connecting" }
  | { phase: "connected"; sessionId: string }
  | { phase: "failed"; code: string; message?: string }
  | { phase: "rate_limited" };

const CALL_LABELS: Record<CallState["phase"], string> = {
  ready: "Call Owner",
  connecting: "Connecting Securely…",
  connected: "Call Connected",
  failed: "Call Failed — Try Again",
  rate_limited: "Too Many Attempts",
};

/* ============================================================
   Action List Data
   ============================================================ */

const ACTIONS = [
  {
    id: "call",
    icon: IconPhone,
    title: "Call Owner",
    subtitle: "Direct masked voice call",
    isPrimary: true,
  },
  {
    id: "parking",
    icon: IconParking,
    title: "Parking Alert",
    subtitle: "Blocking driveway or tow risk",
  },
  {
    id: "lights",
    icon: IconLightbulb,
    title: "Lights Are ON",
    subtitle: "Battery drain warning",
  },
  {
    id: "message",
    icon: IconMessage,
    title: "Send Message",
    subtitle: "Anonymous text ping",
  },
  {
    id: "issue",
    icon: IconWarning,
    title: "Vehicle Issue",
    subtitle: "Window open, dent, or alarm",
  },
] as const;

/* ============================================================
   Main Client Component
   ============================================================ */

interface ScannerClientProps {
  vehicle: VehiclePublicData;
}

export function ScannerClient({ vehicle }: ScannerClientProps) {
  const [callState, setCallState] = useState<CallState>({ phase: "ready" });
  const [activeRow, setActiveRow] = useState<string | null>(null);
  // ── Per-row event state machine ─────────────────────────────────────
  // idle → sending → sent → idle (after 2.5s)
  type RowState = "idle" | "sending" | "sent" | "error";
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  function setRowState(id: string, state: RowState) {
    setRowStates((prev) => ({ ...prev, [id]: state }));
  }

  async function handleAlert(type: string, message?: string) {
    if (rowStates[type] === "sending") return; // debounce
    
    // Close modal if open
    if (type === "custom") {
      setIsMessageModalOpen(false);
      setCustomMessage("");
      setRowState("message", "sending");
    } else {
      setRowState(type, "sending");
    }

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: vehicle.token, type, customNote: message }),
      });
      
      const targetRow = type === "custom" ? "message" : type;
      setRowState(targetRow, res.ok ? "sent" : "error");
    } catch {
      const targetRow = type === "custom" ? "message" : type;
      setRowState(targetRow, "error");
    } finally {
      const targetRow = type === "custom" ? "message" : type;
      setTimeout(() => setRowState(targetRow, "idle"), 3000);
    }
  }

  // ── Call Owner: triggers the server-side bridge via /api/call ──────
  async function handleCallOwner() {
    if (callState.phase !== "ready" && callState.phase !== "failed") return;

    setCallState({ phase: "connecting" });

    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the opaque token is sent — never a phone number
        body: JSON.stringify({ token: vehicle.token }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setCallState({ phase: "rate_limited" });
        return;
      }

      if (!res.ok || data.status === "error") {
        let displayMessage = data.message;
        if (data.code === "UNVERIFIED_NUMBER") {
          displayMessage = "Trial mode: destination number must be verified in Twilio console.";
        } else if (data.code === "AUTH_ERROR") {
          displayMessage = "Authentication Error - verify API keys.";
        }
        setCallState({ 
          phase: "failed", 
          code: data.code ?? "UNKNOWN",
          message: displayMessage
        });
        return;
      }

      setCallState({ phase: "connected", sessionId: data.sessionId });

      // Auto-reset to ready after 8s so user can retry if needed
      setTimeout(() => setCallState({ phase: "ready" }), 8000);
    } catch {
      setCallState({ phase: "failed", code: "NETWORK_ERROR" });
    }
  }

  const isCallBusy =
    callState.phase === "connecting" || callState.phase === "rate_limited";

  const ctaStyle =
    callState.phase === "connected"
      ? "bg-sv-status-ok text-sv-base"
      : callState.phase === "rate_limited"
      ? "bg-sv-surface text-sv-text-muted border border-sv-border cursor-not-allowed"
      : callState.phase === "failed"
      ? "bg-sv-accent-deep text-sv-base"
      : "bg-sv-accent text-sv-base hover:bg-sv-accent-hover active:scale-[0.98]";

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-sv-base">
      <div className="w-full max-w-[430px] mx-auto px-[var(--sv-margin)] py-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-lg)]">

        {/* ── 1. STATUS BAR ── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-[var(--sv-space-sm)]">
            <span className="sv-pulse-dot" aria-hidden="true" />
            <span className="text-label-caps-md text-sv-text-muted">
              Connected to vehicle
            </span>
          </div>
          <div className="flex items-center gap-1 text-sv-text-muted">
            <IconLock className="w-3 h-3" />
            <span className="text-label-caps-sm">Masked</span>
          </div>
        </header>

        {/* ── 2. VEHICLE INFO CARD ── */}
        <section className="sv-card p-[var(--sv-space-md)]" aria-label="Vehicle information">
          <div className="flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-sv-accent shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-label-caps-lg text-sv-text-bright tracking-[0.12em]">
                {vehicle.plate}
              </p>
              <p className="text-sm text-sv-text-muted mt-1">
                {vehicle.make} {vehicle.model}
                {vehicle.color ? ` · ${vehicle.color}` : ""}
              </p>
              <div className="flex items-center gap-1 mt-2 text-sv-text-muted">
                <IconLock className="w-3 h-3" />
                <span className="text-label-caps-sm">Identity Masked</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. HERO CTA — CALL OWNER ── */}
        <section aria-label="Primary action">
          <button
            id="cta-call-owner"
            onClick={handleCallOwner}
            disabled={isCallBusy}
            aria-live="polite"
            aria-label={CALL_LABELS[callState.phase]}
            className={`
              w-full h-14 rounded-[var(--sv-radius-md)]
              flex items-center justify-center gap-3
              font-semibold text-base
              transition-all duration-150 cursor-pointer
              ${ctaStyle}
              ${isCallBusy ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            <IconPhone
              className={`w-5 h-5 ${callState.phase === "connecting" ? "animate-pulse" : ""}`}
            />
            <span>{CALL_LABELS[callState.phase]}</span>
          </button>

          {/* Contextual subtext under CTA */}
          <p className="text-center text-label-caps-sm text-sv-text-muted mt-[var(--sv-space-sm)]">
            {callState.phase === "connected"
              ? `Session · ${(callState as { phase: "connected"; sessionId: string }).sessionId.slice(-8)}`
              : callState.phase === "rate_limited"
              ? "Try again in 10 minutes"
              : callState.phase === "failed"
              ? ((callState as { phase: "failed"; message?: string; code: string }).message || `Error · ${(callState as { phase: "failed"; code: string }).code}`)
              : "Direct & Private · Masked Call"}
          </p>
        </section>

        {/* ── 4. VERTICAL ACTION LIST ── */}
        <section aria-label="Quick actions">
          <div className="sv-card overflow-hidden">
          {ACTIONS.map((action, index) => {
              const Icon = action.icon;
              const isLast = index === ACTIONS.length - 1;
              const isActive = activeRow === action.id;
              const isCall = action.id === "call";
              const rowState = isCall ? "idle" : (rowStates[action.id] ?? "idle");
              const isSending = rowState === "sending";
              const isSent    = rowState === "sent";
              const isError   = rowState === "error";
              const isDisabled = isCall
                ? callState.phase === "connecting" || callState.phase === "rate_limited"
                : isSending;

              return (
                <button
                  key={action.id}
                  id={`action-${action.id}`}
                  disabled={isDisabled}
                  onClick={() => {
                    setActiveRow(action.id);
                    if (isCall) {
                      handleCallOwner();
                    } else if (action.id === "message") {
                      setIsMessageModalOpen(true);
                    } else {
                      handleAlert(action.id);
                    }
                    setTimeout(() => setActiveRow(null), 200);
                  }}
                  className={`
                    sv-action-row w-full flex items-center gap-3
                    px-[var(--sv-space-md)] py-3 text-left
                    ${!isDisabled ? "cursor-pointer" : "cursor-not-allowed opacity-70"}
                    ${!isLast ? "border-b border-sv-border" : ""}
                    ${"isPrimary" in action && action.isPrimary ? "border-l-[3px] border-l-sv-accent" : "border-l-[3px] border-l-transparent"}
                    ${isActive ? "bg-sv-surface-high" : ""}
                    ${isSent ? "bg-sv-status-ok/5" : ""}
                  `}
                  style={{ minHeight: "56px" }}
                >
                  {/* Icon bucket */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors
                    ${isSent  ? "bg-sv-status-ok/20"  : ""}
                    ${isError ? "bg-sv-status-error/20" : ""}
                    ${!isSent && !isError ? "bg-sv-accent-subtle" : ""}
                  `}>
                    {isSending ? (
                      /* Spinner */
                      <svg className="w-4 h-4 text-sv-accent animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                      </svg>
                    ) : isSent ? (
                      <svg className="w-4 h-4 text-sv-status-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : isError ? (
                      <svg className="w-4 h-4 text-sv-status-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <Icon className="w-[18px] h-[18px] text-sv-accent" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-medium leading-tight transition-colors
                      ${isSent  ? "text-sv-status-ok"    : ""}
                      ${isError ? "text-sv-status-error"  : ""}
                      ${!isSent && !isError ? "text-sv-text-primary" : ""}
                    `}>
                      {isSending ? "Calling owner…" : isSent ? "Alert Sent ✓" : isError ? "Failed — try again" : action.title}
                    </p>
                    <p className="text-xs text-sv-text-muted mt-0.5 leading-tight">
                      {isSending ? "Calling owner with alert..." : isSent ? "Automated alert call dispatched to owner" : action.subtitle}
                    </p>
                  </div>

                  {!isSending && !isSent && !isError && (
                    <IconChevronRight className="w-4 h-4 text-sv-text-muted shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 5. SECURITY REASSURANCE ── */}
        <section
          className="sv-card px-[var(--sv-space-md)] py-3 flex items-center gap-[var(--sv-space-sm)]"
          aria-label="Security information"
        >
          <IconShield className="w-4 h-4 text-sv-status-ok shrink-0" />
          <p className="text-label-caps-sm text-sv-text-muted">
            End-to-End Encrypted · No Numbers Shared
          </p>
        </section>

        {/* ── 6. FOOTER ── */}
        <footer className="text-center pt-[var(--sv-space-sm)] pb-[var(--sv-space-lg)]">
          <p className="text-label-caps-sm text-sv-text-muted">
            Powered by Smart Vehicle
          </p>
        </footer>
      </div>

      {/* ── CUSTOM MESSAGE MODAL ── */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="sv-card w-full max-w-[400px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <header className="px-[var(--sv-space-md)] py-4 border-b border-sv-border flex items-center justify-between bg-sv-surface">
              <h3 className="text-[15px] font-semibold text-sv-text-bright">Send Message</h3>
              <button 
                onClick={() => setIsMessageModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sv-surface-high transition-colors"
              >
                <svg className="w-5 h-5 text-sv-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>
            
            <div className="p-[var(--sv-space-md)] bg-sv-surface">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                maxLength={140}
                placeholder="e.g. Your side mirror is folded..."
                className="w-full h-28 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-md)] p-3 text-[15px] text-sv-text-primary placeholder:text-sv-text-muted focus:outline-none focus:border-sv-accent focus:ring-1 focus:ring-sv-accent resize-none transition-all"
                autoFocus
              />
              <div className="flex justify-end mt-2">
                <span className={`text-xs font-medium ${customMessage.length >= 140 ? 'text-sv-status-error' : 'text-sv-text-muted'}`}>
                  {customMessage.length} / 140
                </span>
              </div>
            </div>

            <footer className="px-[var(--sv-space-md)] py-4 border-t border-sv-border bg-sv-surface flex gap-3">
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="flex-1 h-12 rounded-[var(--sv-radius-md)] font-medium text-[15px] text-sv-text-primary bg-sv-surface-high hover:bg-sv-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAlert("custom", customMessage)}
                disabled={!customMessage.trim()}
                className="flex-[2] h-12 rounded-[var(--sv-radius-md)] font-semibold text-[15px] text-sv-base bg-sv-accent hover:bg-sv-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Anonymously
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
