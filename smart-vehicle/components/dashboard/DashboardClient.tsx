"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { VehicleWithToken, VehicleEvent } from "@/lib/vehicle/dashboard";
import { QrModal } from "./QrModal";

/* ── Icons ───────────────────────────────────────────────────── */

function IconCar({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
      <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      <path d="M5 9l2-4h10l2 4" />
    </svg>
  );
}

function IconPhone({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.21 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 1H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconParking({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M13 3H6v18h3v-7h4a5 5 0 0 0 0-10zm0 7H9V6h4a2 2 0 1 1 0 4z" /></svg>;
}

function IconLightbulb({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

function IconSettings({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconMessage({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconWarning({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconQr({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="3" height="3" rx="0.5" />
      <rect x="19" y="14" width="2" height="2" rx="0.5" /><rect x="14" y="19" width="2" height="2" rx="0.5" />
      <rect x="18" y="19" width="3" height="2" rx="0.5" />
    </svg>
  );
}

function IconLogOut({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconMoreVertical({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function IconEdit({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/* ── Event helpers ───────────────────────────────────────────── */

const EVENT_CONFIG = {
  call:    { label: "Call Owner",     Icon: IconPhone,    color: "text-sv-accent" },
  parking: { label: "Parking Alert",  Icon: IconParking,  color: "text-sv-status-warn" },
  lights:  { label: "Lights Are ON",  Icon: IconLightbulb,color: "text-sv-status-warn" },
  message: { label: "Message Sent",   Icon: IconMessage,  color: "text-sv-text-primary" },
  issue:   { label: "Vehicle Issue",  Icon: IconWarning,  color: "text-sv-status-error" },
} as const;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Sub-components ──────────────────────────────────────────── */

function VehicleCard({
  vehicle,
  onQrClick,
  onPauseResume,
  onEditClick,
  onDeleteClick,
  isPending,
}: {
  vehicle: VehicleWithToken;
  onQrClick: () => void;
  onPauseResume: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  isPending: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="sv-card overflow-hidden">
      {/* Accent bar */}
      <div className={`h-0.5 w-full ${vehicle.isProtected ? "bg-sv-accent" : "bg-sv-border"}`} />

      <div className="p-[var(--sv-space-md)]">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-[var(--sv-space-sm)]">
          <div>
            <p className="text-label-caps-lg text-sv-text-bright tracking-[0.1em]">
              {vehicle.plate}
            </p>
            <p className="text-sm text-sv-text-muted mt-0.5">
              {vehicle.make} {vehicle.model}
              {vehicle.color ? ` · ${vehicle.color}` : ""}
            </p>
          </div>

          {/* Status badge & Menu */}
          <div className="flex flex-col items-end gap-2 shrink-0 relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sv-text-muted hover:bg-sv-surface-high transition-colors"
            >
              <IconMoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)} 
                />
                <div className="absolute top-10 right-0 z-20 w-48 py-1 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] shadow-xl animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEditClick();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-sv-text-primary hover:bg-sv-border transition-colors flex items-center gap-2"
                  >
                    <IconEdit className="w-4 h-4 text-sv-text-muted" /> Edit Vehicle
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onPauseResume();
                    }}
                    disabled={isPending}
                    className="w-full px-4 py-2.5 text-left text-sm text-sv-text-primary hover:bg-sv-border transition-colors flex items-center gap-2"
                  >
                    <IconQr className="w-4 h-4 text-sv-text-muted" /> {vehicle.isProtected ? "Pause QR Tag" : "Resume QR Tag"}
                  </button>
                  <div className="h-px bg-sv-border my-1" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteClick();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-sv-danger hover:bg-sv-danger/10 transition-colors flex items-center gap-2"
                  >
                    <IconTrash className="w-4 h-4" /> Delete Vehicle
                  </button>
                </div>
              </>
            )}

            <div className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium
              ${vehicle.isProtected
                ? "border-sv-accent/30 bg-sv-accent/10 text-sv-accent"
                : "border-sv-border bg-sv-surface text-sv-text-muted"
              }
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${vehicle.isProtected ? "bg-sv-accent animate-pulse" : "bg-sv-text-muted"}`} />
              {vehicle.isProtected ? "Protected" : "Paused"}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-[var(--sv-space-sm)]">
          <button
            onClick={onQrClick}
            className="flex-1 flex items-center justify-center gap-2 h-9 rounded-[var(--sv-radius-sm)] border border-sv-border bg-sv-surface text-sv-text-primary text-sm hover:border-sv-accent hover:text-sv-accent transition-colors cursor-pointer"
          >
            <IconQr className="w-3.5 h-3.5" />
            QR Tag
          </button>

          <button
            onClick={onPauseResume}
            disabled={isPending}
            className={`
              flex-1 flex items-center justify-center h-9 rounded-[var(--sv-radius-sm)] border text-sm transition-colors cursor-pointer
              ${vehicle.isProtected
                ? "border-sv-border bg-sv-surface text-sv-text-muted hover:border-sv-status-error hover:text-sv-status-error"
                : "border-sv-accent/30 bg-sv-accent/10 text-sv-accent hover:bg-sv-accent/20"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isPending ? "…" : vehicle.isProtected ? "Pause Tag" : "Resume Tag"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ event }: { event: VehicleEvent }) {
  const cfg = EVENT_CONFIG[event.event_type];
  const Icon = cfg.Icon;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-sv-border last:border-0">
      <div className="w-7 h-7 rounded-full bg-sv-surface-high flex items-center justify-center shrink-0 mt-0.5">
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-sv-text-primary leading-tight">{cfg.label}</p>
        <p className="text-xs text-sv-text-muted mt-0.5">
          {event.vehicle_plate}
        </p>
      </div>
      <span className="text-label-caps-sm text-sv-text-muted shrink-0 mt-0.5">
        {relativeTime(event.created_at)}
      </span>
    </div>
  );
}

function EmptyVehicles() {
  return (
    <div className="sv-card p-[var(--sv-space-lg)] flex flex-col items-center text-center gap-[var(--sv-space-md)]">
      <div className="w-14 h-14 rounded-full bg-sv-surface-high border border-sv-border flex items-center justify-center">
        <IconCar className="w-6 h-6 text-sv-text-muted" />
      </div>
      <div>
        <p className="text-headline-sm text-sv-text-primary">No vehicles yet</p>
        <p className="text-sm text-sv-text-muted mt-1 max-w-xs">
          Register your vehicle to generate a QR tag and start receiving anonymous contact alerts.
        </p>
      </div>
      <a
        href="/vehicles/add"
        className="inline-flex items-center gap-2 h-10 px-5 bg-sv-accent text-sv-base rounded-[var(--sv-radius-sm)] text-sm font-semibold hover:bg-sv-accent-hover transition-colors"
      >
        Add Your First Vehicle
      </a>
    </div>
  );
}

const FIELD_CLASSES =
  "w-full h-11 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] px-3 text-sv-text-primary text-sm placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors";
const LABEL_CLASSES = "block text-label-caps-sm text-sv-text-muted mb-1";

function EditVehicleModal({
  vehicle,
  onClose,
  onSuccess,
}: {
  vehicle: VehicleWithToken;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [plate, setPlate] = useState(vehicle.plate);
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [color, setColor] = useState(vehicle.color || "");
  const [phone, setPhone] = useState(vehicle.phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate_number: plate,
          nickname: make,
          model,
          color,
          contact_phone: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update vehicle");
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md sv-card p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center">
          <h3 className="text-headline-sm text-sv-text-bright">Edit Vehicle</h3>
          <button onClick={onClose} className="text-sv-text-muted hover:text-sv-text-primary p-1">✕</button>
        </div>

        {error && <div className="p-3 rounded bg-sv-danger/10 border border-sv-danger/20 text-sv-danger text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={LABEL_CLASSES}>Plate Number</label>
            <input required type="text" className={FIELD_CLASSES} value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="ABC 123" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASSES}>Make / Nickname</label>
              <input required type="text" className={FIELD_CLASSES} value={make} onChange={(e) => setMake(e.target.value)} placeholder="Tesla" />
            </div>
            <div>
              <label className={LABEL_CLASSES}>Model</label>
              <input required type="text" className={FIELD_CLASSES} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model 3" />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASSES}>Color (Optional)</label>
            <input type="text" className={FIELD_CLASSES} value={color} onChange={(e) => setColor(e.target.value)} placeholder="Midnight Silver" />
          </div>

          <div>
            <label className={LABEL_CLASSES}>Contact Phone (E.164)</label>
            <input required type="tel" className={FIELD_CLASSES} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" pattern="^\+\d{10,15}$" title="Must start with + and country code" />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 h-11 bg-sv-surface border border-sv-border rounded-[var(--sv-radius-sm)] text-sv-text-primary font-medium hover:bg-sv-surface-high transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 h-11 bg-sv-accent text-sv-base rounded-[var(--sv-radius-sm)] font-medium hover:bg-sv-accent-hover active:scale-95 transition-all flex items-center justify-center">
              {saving ? <div className="w-5 h-5 rounded-full border-2 border-sv-base/30 border-t-sv-base animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

interface DashboardClientProps {
  ownerName: string;
  ownerEmail: string;
  vehicles: VehicleWithToken[];
  events: VehicleEvent[];
}

export function DashboardClient({ ownerName, ownerEmail, vehicles, events: initialEvents }: DashboardClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithToken | null>(null);
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleWithToken | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleWithToken | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [liveEvents, setLiveEvents] = useState<VehicleEvent[]>(initialEvents);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // ── Supabase Realtime: stream new events to activity timeline ──────
  useEffect(() => {
    if (vehicles.length === 0) return;

    const vehicleIds = vehicles.map((v) => v.id);

    async function subscribe() {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const channel = supabase
        .channel(`dashboard-events-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "vehicle_events",
          },
          (payload) => {
            const newRow = payload.new as {
              id: string;
              vehicle_id: string;
              event_type: string;
              status: string;
              created_at: string;
              token: string;
            };
            // Only add if it belongs to one of this owner's vehicles
            if (!vehicleIds.includes(newRow.vehicle_id)) return;
            const plate = vehicles.find((v) => v.id === newRow.vehicle_id)?.plate ?? "—";
            setLiveEvents((prev) => [
              {
                id: newRow.id,
                vehicle_id: newRow.vehicle_id,
                event_type: newRow.event_type as VehicleEvent["event_type"],
                status: newRow.status,
                created_at: newRow.created_at,
                vehicle_plate: plate,
              },
              ...prev.slice(0, 19), // keep max 20 items
            ]);
          }
        )
        .subscribe((status) => {
          setRealtimeConnected(status === "SUBSCRIBED");
        });

      return () => { supabase.removeChannel(channel); };
    }

    let cleanup: (() => void) | undefined;
    subscribe().then((fn) => { cleanup = fn; });
    return () => { cleanup?.(); };
  }, [vehicles]);

  async function handleSignOut() {
    const { createBrowserClient } = await import("@supabase/ssr");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  }

  async function handlePauseResume(vehicle: VehicleWithToken) {
    setPendingId(vehicle.id);
    try {
      const action = vehicle.isProtected ? "pause" : "resume";
      await fetch(`/api/vehicles/${vehicle.id}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      startTransition(() => router.refresh());
    } finally {
      setPendingId(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!vehicleToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setDeleting(false);
      setVehicleToDelete(null);
    }
  }

  const protectedCount = vehicles.filter((v) => v.isProtected).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const eventCount = liveEvents.length;

  return (
    <>
      <main className="min-h-screen bg-sv-base">
        <div className="w-full max-w-[430px] mx-auto px-[var(--sv-margin)] py-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-lg)]">

          {/* ── Header ── */}
          <header className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-label-caps-md text-sv-accent tracking-widest">SMART VEHICLE</p>
                {realtimeConnected && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sv-status-ok animate-pulse" />
                    <span className="text-label-caps-sm text-sv-status-ok">Live</span>
                  </span>
                )}
              </div>
              <h1 className="text-headline-md text-sv-text-bright mt-1">
                {greeting}, {ownerName}
              </h1>
              <p className="text-xs text-sv-text-muted mt-0.5">{ownerEmail}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <a
                href="/settings"
                className="w-8 h-8 rounded-full flex items-center justify-center text-sv-text-muted hover:text-sv-text-primary hover:bg-sv-surface transition-colors cursor-pointer"
                title="Settings"
              >
                <IconSettings className="w-4 h-4" />
              </a>
              <button
                onClick={handleSignOut}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sv-text-muted hover:text-sv-text-primary hover:bg-sv-surface transition-colors cursor-pointer"
                title="Sign out"
              >
                <IconLogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* ── Stats row ── */}
          {vehicles.length > 0 && (
            <section className="grid grid-cols-3 gap-2">
              {[
                { label: "Vehicles", value: vehicles.length },
                { label: "Protected", value: protectedCount },
                { label: "Events", value: eventCount },
              ].map((stat) => (
                <div key={stat.label} className="sv-card p-3 text-center">
                  <p className="text-xl font-semibold text-sv-text-bright">{stat.value}</p>
                  <p className="text-label-caps-sm text-sv-text-muted mt-0.5">{stat.label}</p>
                </div>
              ))}
            </section>
          )}

          {/* ── Vehicles section ── */}
          <section>
            <div className="flex items-center justify-between mb-[var(--sv-space-sm)]">
              <p className="text-label-caps-md text-sv-text-muted">Your Vehicles</p>
              <a
                href="/vehicles/add"
                className="text-label-caps-sm text-sv-accent hover:underline"
              >
                + Add Vehicle
              </a>
            </div>

            {vehicles.length === 0 ? (
              <EmptyVehicles />
            ) : (
              <div className="flex flex-col gap-3">
                {vehicles.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    onQrClick={() => setSelectedVehicle(v)}
                    onPauseResume={() => handlePauseResume(v)}
                    onEditClick={() => setVehicleToEdit(v)}
                    onDeleteClick={() => setVehicleToDelete(v)}
                    isPending={pendingId === v.id}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Activity timeline ── */}
          <section>
            <p className="text-label-caps-md text-sv-text-muted mb-[var(--sv-space-sm)]">
              Recent Activity
            </p>

            {liveEvents.length === 0 ? (
              <div className="sv-card px-[var(--sv-space-md)] py-[var(--sv-space-lg)] text-center">
                <p className="text-sm text-sv-text-muted">No activity yet</p>
                <p className="text-xs text-sv-text-muted mt-1">
                  Events will appear here instantly when someone scans your QR tag
                </p>
              </div>
            ) : (
              <div className="sv-card px-[var(--sv-space-md)]">
                {liveEvents.map((e) => (
                  <ActivityItem key={e.id} event={e} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── QR Modal ── */}
      {selectedVehicle && (
        <QrModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onGenerate={() => {
            startTransition(() => router.refresh());
            setSelectedVehicle(null);
          }}
        />
      )}

      {/* ── Edit Vehicle Modal ── */}
      {vehicleToEdit && (
        <EditVehicleModal
          vehicle={vehicleToEdit}
          onClose={() => setVehicleToEdit(null)}
          onSuccess={() => {
            startTransition(() => router.refresh());
            setVehicleToEdit(null);
          }}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm sv-card p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-headline-sm text-sv-danger text-center">Delete Vehicle?</h3>
            <p className="text-sm text-sv-text-primary text-center">
              Are you sure you want to delete <span className="font-semibold">{vehicleToDelete.plate}</span>?
            </p>
            <p className="text-xs text-sv-text-muted text-center leading-relaxed">
              This will permanently invalidate all associated QR tags. This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setVehicleToDelete(null)}
                className="flex-1 h-10 bg-sv-surface border border-sv-border rounded-[var(--sv-radius-sm)] text-sv-text-primary font-medium hover:bg-sv-surface-high transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 h-10 bg-sv-danger text-white rounded-[var(--sv-radius-sm)] font-medium hover:bg-sv-danger/90 active:scale-95 transition-all flex items-center justify-center"
              >
                {deleting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
