"use client";

import { useState, useEffect, useRef } from "react";
import type { VehicleWithToken } from "@/lib/vehicle/dashboard";

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

function IconPrinter({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

/* ── Card design constants ────────────────────────────────────── */

const CARD_W = 350;
const CARD_H = 500;
const PRINT_SCALE = 3; // 3x for ~300 DPI print quality

const COLORS = {
  base:    "#0A0A0C",
  surface: "#161618",
  border:  "#2A2A2E",
  accent:  "#D4A017",
  textBright: "#FFFFFF",
  textPrimary: "#E4E4E7",
  textMuted: "#8E8E93",
  ok:      "#30D158",
};

/* ── Canvas drawing helpers ───────────────────────────────────── */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function drawCard(
  canvas: HTMLCanvasElement,
  plate: string,
  qrDataUrl: string,
  scale: number
) {
  const W = CARD_W * scale;
  const H = CARD_H * scale;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const s = scale; // shorthand

  // Wait for fonts
  await document.fonts.ready;

  // ── Background ──
  roundRect(ctx, 0, 0, W, H, 16 * s);
  ctx.fillStyle = COLORS.base;
  ctx.fill();

  // Border
  roundRect(ctx, 0, 0, W, H, 16 * s);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();

  // ── Accent bar at top ──
  ctx.save();
  roundRect(ctx, 0, 0, W, 5 * s, 16 * s);
  ctx.clip();
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(0, 0, W, 5 * s);
  ctx.restore();

  // ── "SCAN TO CONTACT OWNER" label ──
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `600 ${10 * s}px 'JetBrains Mono', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCAN TO CONTACT OWNER", W / 2, 42 * s);

  // ── QR code ──
  const qrSize = 200 * s;
  const qrX = (W - qrSize) / 2;
  const qrY = 65 * s;

  // QR background pad
  roundRect(ctx, qrX - 12 * s, qrY - 12 * s, qrSize + 24 * s, qrSize + 24 * s, 8 * s);
  ctx.fillStyle = COLORS.surface;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = s;
  ctx.stroke();

  // Draw QR image
  const img = new Image();
  img.src = qrDataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
  });
  ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

  // ── Vehicle Plate ──
  ctx.fillStyle = COLORS.textBright;
  ctx.font = `700 ${20 * s}px 'JetBrains Mono', monospace`;
  ctx.textAlign = "center";
  ctx.fillText(plate, W / 2, 310 * s);

  // ── Divider ──
  const divY = 335 * s;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = s;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, divY);
  ctx.lineTo(W * 0.8, divY);
  ctx.stroke();

  // ── Instructions ──
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `400 ${11 * s}px 'Space Grotesk', sans-serif`;
  ctx.fillText("Scan this QR code to contact the", W / 2, 365 * s);
  ctx.fillText("vehicle owner privately and securely.", W / 2, 385 * s);

  // ── Shield icon (drawn as simple path) ──
  const shieldY = 415 * s;
  const shieldSize = 14 * s;
  const sx = W / 2 - 52 * s;
  ctx.strokeStyle = COLORS.ok;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(sx + shieldSize / 2, shieldY);
  ctx.lineTo(sx, shieldY + shieldSize * 0.25);
  ctx.lineTo(sx, shieldY + shieldSize * 0.65);
  ctx.quadraticCurveTo(sx + shieldSize / 2, shieldY + shieldSize, sx + shieldSize / 2, shieldY + shieldSize);
  ctx.quadraticCurveTo(sx + shieldSize / 2, shieldY + shieldSize, sx + shieldSize, shieldY + shieldSize * 0.65);
  ctx.lineTo(sx + shieldSize, shieldY + shieldSize * 0.25);
  ctx.closePath();
  ctx.stroke();

  // ── Privacy text ──
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `600 ${8 * s}px 'JetBrains Mono', monospace`;
  ctx.fillText("PRIVACY PROTECTED", W / 2 + 8 * s, 424 * s);

  // ── Brand ──
  ctx.fillStyle = COLORS.accent;
  ctx.font = `600 ${10 * s}px 'JetBrains Mono', monospace`;
  ctx.fillText("SMART VEHICLE", W / 2, 468 * s);

  // ── Subtle bottom accent line ──
  ctx.save();
  roundRect(ctx, 0, H - 4 * s, W, 4 * s, 16 * s);
  ctx.clip();
  ctx.fillStyle = COLORS.accent;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, H - 4 * s, W, 4 * s);
  ctx.restore();
}

/* ── Component ────────────────────────────────────────────────── */

interface PrintableQrCardProps {
  vehicle: VehicleWithToken;
  baseUrl: string;
  onBack: () => void;
}

export function PrintableQrCard({ vehicle, baseUrl, onBack }: PrintableQrCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const scanUrl = vehicle.activeToken ? `${baseUrl}/t/${vehicle.activeToken}` : null;

  // Generate QR as data URL (PNG) for canvas compositing
  useEffect(() => {
    if (!scanUrl) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(scanUrl, {
        margin: 2,
        width: 200 * PRINT_SCALE,
        color: { dark: "#D4A017FF", light: "#0A0A0CFF" },
        errorCorrectionLevel: "H",
      }).then((url) => setQrDataUrl(url));
    });
  }, [scanUrl]);

  // Render card on canvas when QR is ready
  useEffect(() => {
    if (!qrDataUrl || !canvasRef.current) return;
    // Draw preview at 1x
    drawCard(canvasRef.current, vehicle.plate, qrDataUrl, 1).then(() =>
      setReady(true)
    );
  }, [qrDataUrl, vehicle.plate]);

  async function handleDownloadPng() {
    if (!qrDataUrl) return;
    const offscreen = document.createElement("canvas");
    await drawCard(offscreen, vehicle.plate, qrDataUrl, PRINT_SCALE);
    const link = document.createElement("a");
    link.download = `smart-vehicle-qr-${vehicle.plate.replace(/[^A-Z0-9]/gi, "-")}.png`;
    link.href = offscreen.toDataURL("image/png");
    link.click();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-col gap-[var(--sv-space-md)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-caps-md text-sv-text-muted">Printable QR Card</p>
          <p className="text-headline-sm text-sv-text-bright mt-0.5">{vehicle.plate}</p>
        </div>
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-sv-surface-high flex items-center justify-center text-sv-text-muted hover:text-sv-text-primary transition-colors cursor-pointer"
          aria-label="Back"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>

      {/* Card preview */}
      <div className="sv-print-area flex items-center justify-center bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-md)] p-6">
        {!scanUrl ? (
          <div className="text-center py-8">
            <p className="text-sm text-sv-text-muted">No active QR tag</p>
            <p className="text-xs text-sv-text-muted mt-1">
              Generate a tag first, then come back to print
            </p>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={CARD_W}
            height={CARD_H}
            className="rounded-[12px] max-w-full h-auto"
            style={{ imageRendering: "auto" }}
          />
        )}
      </div>

      {/* Actions */}
      {scanUrl && (
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPng}
            disabled={!ready}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[var(--sv-radius-sm)] bg-sv-accent text-sv-base text-sm font-semibold hover:bg-sv-accent-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <IconDownload className="w-4 h-4" />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            disabled={!ready}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[var(--sv-radius-sm)] border border-sv-border bg-sv-surface text-sv-text-primary text-sm hover:border-sv-accent hover:text-sv-accent transition-colors disabled:opacity-50 cursor-pointer"
          >
            <IconPrinter className="w-4 h-4" />
            Print / PDF
          </button>
        </div>
      )}

      {/* Tip */}
      <p className="text-label-caps-sm text-sv-text-muted text-center">
        PNG is print-ready at 300 DPI · Place card on your windshield
      </p>
    </div>
  );
}
