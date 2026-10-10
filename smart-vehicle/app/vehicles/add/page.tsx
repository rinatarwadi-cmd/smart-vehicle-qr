"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const FIELD_CLASSES =
  "w-full h-11 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] px-3 text-sv-text-primary text-sm placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors";

const LABEL_CLASSES = "text-label-caps-sm text-sv-text-muted";

export default function AddVehiclePage() {
  const router = useRouter();

  const [plate,    setPlate]    = useState("");
  const [make,     setMake]     = useState("");
  const [model,    setModel]    = useState("");
  const [color,    setColor]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    const { error: insertError } = await supabase
      .from("vehicles")
      .insert({
        owner_id: user.id,
        plate:    plate.trim().toUpperCase(),
        make:     make.trim(),
        model:    model.trim(),
        color:    color.trim(),
        phone:    phone.trim(),
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          <p className="text-label-caps-md text-sv-accent tracking-widest">SMART VEHICLE</p>
          <h1 className="text-headline-md text-sv-text-bright mt-1">Add Vehicle</h1>
          <p className="text-sm text-sv-text-muted mt-1">
            Register your vehicle to generate a QR tag
          </p>
        </header>

        <form onSubmit={handleSubmit} className="sv-card p-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-md)]">

          {error && (
            <div className="bg-sv-accent-deep/20 border border-sv-accent-deep rounded-[var(--sv-radius-sm)] px-3 py-2">
              <p className="text-sm text-sv-accent">{error}</p>
            </div>
          )}

          {/* Plate */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="plate" className={LABEL_CLASSES}>License Plate *</label>
            <input
              id="plate"
              type="text"
              required
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="KA-01-AB-1234"
              maxLength={20}
              className={FIELD_CLASSES + " font-mono tracking-widest"}
            />
          </div>

          {/* Make + Model */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="make" className={LABEL_CLASSES}>Make *</label>
              <input
                id="make"
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Toyota"
                className={FIELD_CLASSES}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="model" className={LABEL_CLASSES}>Model *</label>
              <input
                id="model"
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Innova"
                className={FIELD_CLASSES}
              />
            </div>
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="color" className={LABEL_CLASSES}>Color</label>
            <input
              id="color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Pearl White"
              className={FIELD_CLASSES}
            />
          </div>

          {/* Phone — privacy notice */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className={LABEL_CLASSES}>Contact Number *</label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className={FIELD_CLASSES}
            />
            <p className="text-label-caps-sm text-sv-text-muted">
              Never shared publicly — used only for the masked call bridge
            </p>
          </div>

          <button
            id="btn-add-vehicle"
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-sv-accent text-sv-base rounded-[var(--sv-radius-sm)] font-semibold text-sm hover:bg-sv-accent-hover active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
          >
            {loading ? "Registering…" : "Register Vehicle"}
          </button>
        </form>

        {/* Privacy assurance */}
        <div className="sv-card px-[var(--sv-space-md)] py-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-sv-status-ok shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <p className="text-label-caps-sm text-sv-text-muted">
            Your number is encrypted and never shown to callers
          </p>
        </div>
      </div>
    </main>
  );
}
