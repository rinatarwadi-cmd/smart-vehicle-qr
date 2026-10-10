"use client";

import { useState, useEffect, useCallback } from "react";
import type { VehicleWithToken } from "@/lib/vehicle/dashboard";
import { PrintableQrCard } from "./PrintableQrCard";

/* ── Icons ────────────────────────────────────────────────────── */

function IconX({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconDownload({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconRefresh({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconWifi({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function IconChevron({ className = "w-3.5 h-3.5", up = false }: { className?: string; up?: boolean }) {
  return (
    <svg className={`${className} transition-transform ${up ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ── URL Resolution ───────────────────────────────────────────── */

/**
 * Resolves the base URL for QR codes with this priority:
 * 1. Explicit override (user-entered in the modal)
 * 2. NEXT_PUBLIC_APP_URL env var (if non-empty)
 * 3. window.location.origin (runtime — picks up LAN IP automatically)
 * 4. Fallback: http://localhost:3000
 */
function resolveBaseUrl(override?: string): string {
  // 1. Explicit override
  if (override && override.trim()) {
    return override.trim().replace(/\/+$/, "");
  }

  // 2. Env var (compile-time, only if non-empty)
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // 3. Runtime browser origin (captures LAN IP when accessed over hotspot)
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  // 4. Fallback
  return "http://localhost:3000";
}

/* ── Types ────────────────────────────────────────────────────── */

interface QrModalProps {
  vehicle: VehicleWithToken;
  onClose: () => void;
  onGenerate: () => void;
}

/* ── Component ────────────────────────────────────────────────── */

export function QrModal({ vehicle, onClose, onGenerate }: QrModalProps) {
  const [svgString, setSvgString] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showPrintCard, setShowPrintCard] = useState(false);

  // ── Base URL override (dev aid) ──
  const [showNetConfig, setShowNetConfig] = useState(false);
  const [urlOverride, setUrlOverride] = useState("");

  // Resolved base URL
  const baseUrl = resolveBaseUrl(urlOverride);
  const scanUrl = vehicle.activeToken ? `${baseUrl}/t/${vehicle.activeToken}` : null;

  // ── Generate QR SVG ──
  const generateSvg = useCallback(() => {
    if (!scanUrl) {
      setLoading(false);
      return;
    }
    setLoading(true);
    import("qrcode").then((QRCode) => {
      QRCode.toString(scanUrl, {
        type: "svg",
        margin: 2,
        color: { dark: "#D4A017", light: "#0A0A0C" },
        errorCorrectionLevel: "H",
        width: 280,
      }).then((svg) => {
        setSvgString(svg);
        setLoading(false);
      });
    });
  }, [scanUrl]);

  useEffect(() => {
    generateSvg();
  }, [generateSvg]);

  function handleDownload() {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartvehicle-qr-${vehicle.plate.replace(/[^A-Z0-9]/gi, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleGenerate() {
    setGenerating(true);
    await fetch(`/api/vehicles/${vehicle.id}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });
    setGenerating(false);
    onGenerate();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet */}
      <div className="w-full max-w-[430px] sv-card rounded-b-none rounded-t-[var(--sv-radius-lg)] p-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-md)] animate-in slide-in-from-bottom duration-200">

        {/* ── Print Card View ── */}
        {showPrintCard ? (
          <PrintableQrCard
            vehicle={vehicle}
            baseUrl={baseUrl}
            onBack={() => setShowPrintCard(false)}
          />
        ) : (
        <>
        {/* Handle + header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-caps-md text-sv-text-muted">QR Tag</p>
            <p className="text-headline-sm text-sv-text-bright mt-0.5">{vehicle.plate}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sv-surface-high flex items-center justify-center text-sv-text-muted hover:text-sv-text-primary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* QR display area */}
        <div className="bg-sv-base border border-sv-border rounded-[var(--sv-radius-md)] flex items-center justify-center p-6 min-h-[240px]">
          {loading ? (
            <div className="sv-skeleton w-[200px] h-[200px] rounded" />
          ) : !scanUrl ? (
            <div className="text-center">
              <p className="text-sm text-sv-text-muted">No active QR tag</p>
              <p className="text-xs text-sv-text-muted mt-1">Generate one below</p>
            </div>
          ) : svgString ? (
            <div
              dangerouslySetInnerHTML={{ __html: svgString }}
              className="w-[200px] h-[200px]"
              aria-label={`QR code for ${vehicle.plate}`}
            />
          ) : null}
        </div>

        {/* Resolved Scan URL display */}
        {scanUrl && (
          <div className="bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] px-3 py-2">
            <p className="text-label-caps-sm text-sv-text-muted mb-1">Public Scan URL</p>
            <p className="text-xs text-sv-text-primary font-mono break-all leading-relaxed">
              {scanUrl}
            </p>
          </div>
        )}

        {/* ── Network / Base URL Config (Dev Aid) ── */}
        <div className="border border-sv-border rounded-[var(--sv-radius-sm)] overflow-hidden">
          <button
            onClick={() => setShowNetConfig(!showNetConfig)}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-sv-surface-high transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <IconWifi className="w-3.5 h-3.5 text-sv-text-muted" />
              <span className="text-label-caps-sm text-sv-text-muted">Network / Base URL</span>
            </div>
            <IconChevron className="w-3.5 h-3.5 text-sv-text-muted" up={showNetConfig} />
          </button>

          {showNetConfig && (
            <div className="px-3 pb-3 pt-1 border-t border-sv-border flex flex-col gap-2">
              <p className="text-[10px] text-sv-text-muted leading-relaxed">
                Override the base URL encoded in the QR code. Use your LAN IP
                (e.g. <code className="text-sv-accent">http://192.168.1.5:3000</code>) for
                mobile scanning over Wi-Fi / hotspot.
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlOverride}
                  onChange={(e) => setUrlOverride(e.target.value)}
                  placeholder={resolveBaseUrl()}
                  className="flex-1 h-9 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] px-2.5 text-xs text-sv-text-primary font-mono placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors"
                />
                {urlOverride && (
                  <button
                    onClick={() => setUrlOverride("")}
                    className="h-9 px-3 text-xs text-sv-text-muted border border-sv-border rounded-[var(--sv-radius-sm)] hover:border-sv-accent hover:text-sv-accent transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              {urlOverride && (
                <p className="text-[10px] text-sv-status-ok">
                  ✓ QR now encodes: {baseUrl}/t/...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {scanUrl && (
            <button
              onClick={handleDownload}
              disabled={!svgString}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[var(--sv-radius-sm)] bg-sv-accent text-sv-base text-sm font-semibold hover:bg-sv-accent-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              <IconDownload className="w-4 h-4" />
              Download SVG
            </button>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[var(--sv-radius-sm)] border border-sv-border bg-sv-surface text-sv-text-primary text-sm hover:border-sv-accent hover:text-sv-accent transition-colors disabled:opacity-50 cursor-pointer"
          >
            <IconRefresh className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            {vehicle.activeToken ? "Regenerate" : "Generate Tag"}
          </button>
        </div>

        {/* Print QR Card button */}
        {scanUrl && (
          <button
            onClick={() => setShowPrintCard(true)}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-[var(--sv-radius-sm)] border border-sv-border bg-sv-surface text-sv-text-muted text-sm hover:border-sv-accent hover:text-sv-accent transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print QR Card
          </button>
        )}

        {/* Warning for regenerate */}
        {vehicle.activeToken && (
          <p className="text-label-caps-sm text-sv-text-muted text-center">
            Regenerating invalidates the current printed tag
          </p>
        )}
        </>
        )}
      </div>
    </div>
  );
}
