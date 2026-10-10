"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useParams } from "next/navigation";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const FIELD_CLASSES =
  "w-full h-11 bg-sv-surface-high border border-sv-border rounded-[var(--sv-radius-sm)] px-3 text-sv-text-primary text-sm placeholder:text-sv-text-muted outline-none focus:border-sv-accent transition-colors";

const LABEL_CLASSES = "text-label-caps-sm text-sv-text-muted";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [plate,    setPlate]    = useState("");
  const [make,     setMake]     = useState("");
  const [model,    setModel]    = useState("");
  const [color,    setColor]    = useState("");
  const [phone,    setPhone]    = useState("");
  
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    async function loadVehicle() {
      if (!vehicleId) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      const { data: vehicle, error: fetchError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (fetchError || !vehicle) {
        setError("Vehicle not found.");
        setLoading(false);
        return;
      }

      if (vehicle.owner_id !== user.id) {
        setError("Unauthorized.");
        setLoading(false);
        return;
      }

      setPlate(vehicle.plate);
      setMake(vehicle.make);
      setModel(vehicle.model);
      setColor(vehicle.color || "");
      setPhone(vehicle.phone || "");
      
      setLoading(false);
    }
    loadVehicle();
  }, [vehicleId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    const { error: updateError } = await supabase
      .from("vehicles")
      .update({
        plate:    plate.trim().toUpperCase(),
        make:     make.trim(),
        model:    model.trim(),
        color:    color.trim(),
        phone:    phone.trim(),
      })
      .eq("id", vehicleId)
      .eq("owner_id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          <p className="text-label-caps-md text-sv-accent tracking-widest">SMART VEHICLE</p>
          <h1 className="text-headline-md text-sv-text-bright mt-1">Edit Vehicle</h1>
        </header>

        {error && error === "Vehicle not found." ? (
          <div className="sv-card p-[var(--sv-space-lg)]">
            <p className="text-sm text-sv-danger">{error}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="sv-card p-[var(--sv-space-lg)] flex flex-col gap-[var(--sv-space-md)]">

            {error && (
              <div className="bg-sv-danger-subtle border border-sv-danger rounded-[var(--sv-radius-sm)] px-3 py-2">
                <p className="text-sm text-sv-danger">{error}</p>
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

            {/* Phone */}
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
            </div>

            <button
              id="btn-edit-vehicle"
              type="submit"
              disabled={saving}
              className="w-full h-11 bg-sv-accent text-sv-base rounded-[var(--sv-radius-sm)] font-semibold text-sm hover:bg-sv-accent-hover active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
