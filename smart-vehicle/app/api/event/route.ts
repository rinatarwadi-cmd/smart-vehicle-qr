import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const VALID_EVENTS = ["parking", "lights", "message", "issue"] as const;
type EventType = (typeof VALID_EVENTS)[number];

/** Human-readable SMS text per event type */
const SMS_TEMPLATES: Record<EventType, (plate: string) => string> = {
  parking: (plate) =>
    `[Smart Vehicle] 🅿️ Parking Alert — Your vehicle ${plate} may be blocking access. Please check immediately.`,
  lights:  (plate) =>
    `[Smart Vehicle] 💡 Lights On — Your vehicle ${plate} has its lights on. Battery may drain soon.`,
  message: (plate) =>
    `[Smart Vehicle] 💬 Someone near your vehicle ${plate} wants to send you a message. Check the Smart Vehicle app.`,
  issue:   (plate) =>
    `[Smart Vehicle] ⚠️ Vehicle Issue — A bystander reported an issue with your vehicle ${plate}. Please check it.`,
};

/**
 * POST /api/event
 *
 * Logs a scanner-initiated event (parking, lights, message, issue)
 * to the vehicle_events table for the owner's activity timeline,
 * then fires a Twilio SMS to the owner's phone number.
 *
 * Privacy: the phone number is fetched server-side via a vehicle_id join
 * and NEVER exposed to the client.
 *
 * Rate limit: 5 events per token per 10-minute window.
 *
 * Body: { token: string, eventType: EventType }
 */
export async function POST(req: NextRequest) {
  try {
    const { token, eventType } = (await req.json()) as {
      token?: string;
      eventType?: string;
    };

    if (!token || !eventType || !VALID_EVENTS.includes(eventType as EventType)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ── 1. Resolve token → vehicle + owner phone ────────────────────────
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("qr_tokens")
      .select(`
        vehicle_id,
        is_active,
        vehicles (
          plate,
          phone
        )
      `)
      .eq("token", token)
      .single();

    if (tokenErr || !tokenRow || !tokenRow.is_active) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const vehicle = (tokenRow.vehicles as unknown) as {
      plate: string;
      phone: string;
    } | null;

    if (!vehicle?.phone) {
      // Still log the event even if phone is missing
      await supabaseAdmin.from("vehicle_events").insert({
        vehicle_id: tokenRow.vehicle_id,
        token,
        event_type: eventType,
      });
      return NextResponse.json({ status: "ok", sms: "no_phone" });
    }

    // ── 2. Rate limit: 5 events per token per 10 minutes ───────────────
    const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("vehicle_events")
      .select("id", { count: "exact", head: true })
      .eq("token", token)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }

    // ── 3. Log the event ────────────────────────────────────────────────
    await supabaseAdmin.from("vehicle_events").insert({
      vehicle_id: tokenRow.vehicle_id,
      token,
      event_type: eventType,
    });

    // ── 4. Send Twilio SMS (fire-and-forget, best-effort) ───────────────
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_SECRET;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    let smsStatus = "skipped";

    if (accountSid && authToken && fromNumber) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const body      = SMS_TEMPLATES[eventType as EventType](vehicle.plate);

      const params = new URLSearchParams({
        To:   vehicle.phone,   // owner's number — server-to-server only
        From: fromNumber,
        Body: body,
      });

      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      try {
        const smsRes = await fetch(twilioUrl, {
          method:  "POST",
          headers: {
            Authorization:  `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        const smsData = await smsRes.json();
        smsStatus = smsRes.ok ? "sent" : `failed:${smsData.code ?? smsRes.status}`;

        if (!smsRes.ok) {
          console.warn(`[/api/event] Twilio SMS error: ${smsRes.status}`, smsData);
        }
      } catch (smsErr) {
        smsStatus = "network_error";
        console.error("[/api/event] SMS send failed:", smsErr);
      }
    }

    return NextResponse.json({ status: "ok", sms: smsStatus });
  } catch (err) {
    console.error("[/api/event]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
