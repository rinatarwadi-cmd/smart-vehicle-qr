"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function IconPhone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

function IconTrash({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

const FIELD_CLASSES =
  "w-full h-11 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] px-3 text-sv-text-primary text-sm placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors";

export default function SettingsPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }
      
      const userPhone = user.user_metadata?.phone || "";
      const userAlerts = user.user_metadata?.alerts !== false; // Default true
      
      if (!userPhone) {
        // Fallback to vehicle phone if none in metadata
        const { data: vehicles } = await supabase.from("vehicles").select("phone").limit(1);
        if (vehicles && vehicles.length > 0 && vehicles[0].phone) {
          setPhone(vehicles[0].phone);
        }
      } else {
        setPhone(userPhone);
      }
      setAlertsEnabled(userAlerts);
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Update user metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { phone, alerts: alertsEnabled },
    });

    if (authError) {
      setError(authError.message);
      setSaving(false);
      return;
    }

    // 2. Cascade phone to all vehicles to maintain Twilio logic
    const { error: dbError } = await supabase
      .from("vehicles")
      .update({ phone })
      .eq("owner_id", user.id);

    if (dbError) {
      console.error("Failed to update vehicles phone:", dbError);
      // We don't block user success, but we should log it
    }

    setSuccessMsg("Settings saved successfully.");
    setSaving(false);
  }

  async function handleDeleteAccount() {
    setSaving(true);
    setError(null);
    
    // Server endpoint needed for safe account deletion
    const res = await fetch("/api/account", {
      method: "DELETE",
    });

    if (!res.ok) {
      setError("Failed to delete account. Please contact support.");
      setSaving(false);
      setShowDeleteModal(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-sv-base flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-sv-border border-t-sv-accent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sv-base">
      <div className="w-full max-w-[430px] mx-auto px-[var(--sv-margin)] py-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-lg)]">
        {/* Header */}
        <header>
          <button
            onClick={() => router.back()}
            className="text-label-caps-sm text-sv-text-muted hover:text-sv-text-primary transition-colors mb-[var(--sv-space-md)] cursor-pointer"
          >
            ← Back
          </button>
          <p className="text-label-caps-md text-sv-accent tracking-widest">APEX COCKPIT</p>
          <h1 className="text-headline-md text-sv-text-bright mt-1">Profile & Settings</h1>
        </header>

        <form onSubmit={handleSaveSettings} className="sv-card p-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-md)]">
          
          {error && (
            <div className="bg-sv-danger-subtle border border-sv-danger rounded-[var(--sv-radius-sm)] px-3 py-2">
              <p className="text-sm text-sv-danger">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-sv-status-ok/10 border border-sv-status-ok/30 rounded-[var(--sv-radius-sm)] px-3 py-2">
              <p className="text-sm text-sv-status-ok">{successMsg}</p>
            </div>
          )}

          {/* Contact Phone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-label-caps-sm text-sv-text-muted flex items-center gap-2">
              <IconPhone className="w-4 h-4" />
              Verified Contact Number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className={FIELD_CLASSES}
            />
            <p className="text-xs text-sv-text-muted leading-tight mt-1">
              This number is used to route anonymous Twilio calls from your QR tags. Changing this will update all your registered vehicles.
            </p>
          </div>

          <div className="h-px bg-sv-border my-2" />

          {/* Notification Preferences */}
          <div className="flex flex-col gap-3">
            <label className="text-label-caps-sm text-sv-text-muted flex items-center gap-2">
              <IconBell className="w-4 h-4" />
              Notification Preferences
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={(e) => setAlertsEnabled(e.target.checked)}
                  className="w-5 h-5 accent-sv-accent"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-sv-text-primary">Enable SMS Alerts</p>
                <p className="text-xs text-sv-text-muted mt-0.5">
                  Receive SMS notifications for parking alerts, battery warnings, and other urgent vehicle events.
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 bg-sv-accent text-sv-base rounded-[var(--sv-radius-sm)] font-semibold text-sm hover:bg-sv-accent-hover active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>

        {/* Danger Zone */}
        <section className="sv-card p-[var(--sv-space-lg)] border-sv-danger/30">
          <h2 className="text-label-caps-md text-sv-danger flex items-center gap-2">
            <IconTrash className="w-4 h-4" />
            Danger Zone
          </h2>
          <p className="text-sm text-sv-text-muted mt-2 mb-4 leading-relaxed">
            Permanently delete your account, wipe all registered vehicles, and permanently disable all associated QR tags. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full h-10 bg-sv-surface border border-sv-danger text-sv-danger rounded-[var(--sv-radius-sm)] font-medium text-sm hover:bg-sv-danger hover:text-white active:scale-[0.98] transition-all"
          >
            Delete Account
          </button>
        </section>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm sv-card p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-headline-sm text-sv-danger text-center">Are you absolutely sure?</h3>
            <p className="text-sm text-sv-text-primary text-center">
              This will permanently delete your account and all associated vehicles.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-10 bg-sv-surface border border-sv-border rounded-[var(--sv-radius-sm)] text-sv-text-primary font-medium hover:bg-sv-surface-high transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={saving}
                className="flex-1 h-10 bg-sv-danger text-white rounded-[var(--sv-radius-sm)] font-medium hover:bg-sv-danger/90 active:scale-95 transition-all flex items-center justify-center"
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
