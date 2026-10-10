import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Simple in-memory rate limiting (Note: In a distributed production environment like Vercel, 
// this is scoped per lambda instance. Use Upstash Redis or a Supabase table for strict global limits).
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 3;

/**
 * POST /api/message
 *
 * Sends a preset or custom SMS alert to the vehicle owner.
 *
 * Request body: { token: string, type: 'parking' | 'lights' | 'issue' | 'custom', message?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, type, customNote } = body as { token?: string; type?: string; customNote?: string };

    // ── 1. Validate input ──────────────────────────────────────────────
    if (!token || typeof token !== "string" || token.length < 4) {
      return NextResponse.json({ status: "error", code: "INVALID_TOKEN" }, { status: 400 });
    }

    if (!['parking', 'lights', 'issue', 'custom'].includes(type || '')) {
      return NextResponse.json({ status: "error", code: "INVALID_TYPE" }, { status: 400 });
    }

    if (type === 'custom' && (!customNote || customNote.length > 140)) {
      return NextResponse.json({ status: "error", code: "INVALID_MESSAGE" }, { status: 400 });
    }

    // ── 2. Rate limiting (per IP/Token) ────────────────────────────────
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const rateLimitKey = `${ip}_${token}`;
    const now = Date.now();
    const rateData = rateLimitMap.get(rateLimitKey) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > RATE_LIMIT_WINDOW_MS) {
      rateData.count = 0;
      rateData.lastReset = now;
    }

    if (rateData.count >= MAX_MESSAGES_PER_WINDOW) {
      return NextResponse.json({ status: "error", code: "RATE_LIMITED" }, { status: 429 });
    }

    rateData.count++;
    rateLimitMap.set(rateLimitKey, rateData);

    // ── 3. Check Config ───────────────────────────────────────────────
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ status: "error", code: "MISSING_CONFIG" }, { status: 500 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ── 4. Resolve token → owner phone & plate ─────────────────────────
    const { data: tokenRow, error: tokenError } = await supabaseAdmin
      .from("qr_tokens")
      .select(
        `
        is_active,
        expires_at,
        vehicles (
          phone,
          plate
        )
      `
      )
      .eq("token", token)
      .single();

    if (tokenError || !tokenRow) {
      return NextResponse.json({ status: "error", code: "TOKEN_NOT_FOUND" }, { status: 404 });
    }

    if (!tokenRow.is_active) {
      return NextResponse.json({ status: "error", code: "TOKEN_INACTIVE" }, { status: 403 });
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json({ status: "error", code: "TOKEN_EXPIRED" }, { status: 403 });
    }

    const vehicleData = tokenRow.vehicles as unknown as { phone: string; plate: string } | null;
    const ownerPhone = vehicleData?.phone;
    const plate = vehicleData?.plate || 'Unknown Plate';

    if (!ownerPhone) {
      return NextResponse.json({ status: "error", code: "OWNER_UNREACHABLE" }, { status: 503 });
    }

    // ── 5. Construct Voice Message ───────────────────────────────────────────
    const alertScripts: Record<string, string> = {
      parking: 'Smart Vehicle alert: Your vehicle is blocking a driveway or at risk of being towed. Please move it.',
      lights: 'Smart Vehicle alert: The headlights or cabin lights are left on in your vehicle.',
      issue: 'Smart Vehicle alert: An urgent issue was reported for your parked vehicle.',
      custom: customNote ? `Smart Vehicle message: ${customNote}` : 'Smart Vehicle alert: A passerby reported an issue with your vehicle.'
    };
    
    // Default to 'parking' if type is somehow missing
    const messageText = alertScripts[type || 'parking'] || alertScripts.parking;

    // ── 6. Twilio API call (using native fetch) ────────────────────────
    const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const authToken  = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    const fromNumber = (process.env.TWILIO_PHONE_NUMBER || '').trim();

    try {
      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      
      // Construct Trial-Compliant Outbound URL
      const baseBinUrl = process.env.TWILIO_VOICE_URL || 'https://handler.twilio.com/twiml/EHf6dfce9d572d631ddf9617dcf60b6b57';
      const fullVoiceUrl = `${baseBinUrl}?Message=${encodeURIComponent(messageText)}`;
      
      console.log('Dispatching alert call to:', ownerPhone, 'URL:', fullVoiceUrl);
      
      const payload = new URLSearchParams();
      payload.append('To', ownerPhone);
      payload.append('From', fromNumber);
      payload.append('Url', fullVoiceUrl);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Twilio Voice Alert Failed:', response.status, data);
        return NextResponse.json({ status: 'error', code: 'BRIDGE_FAILED', message: data.message || 'Voice alert failed', twilioError: data }, { status: 400 });
      }

      console.log('--- TWILIO VOICE ALERT SUCCESS ---', data.sid);
      
      // Save alert record to Supabase
      await supabaseAdmin.from("call_attempts").insert({
        token,
        session_id: data.sid,
      });

      return NextResponse.json({ status: 'success', messageSid: data.sid });
    } catch (err: any) {
      console.error('Twilio Voice fetch failed:', err);
      return NextResponse.json({ status: 'error', code: 'NETWORK_ERROR', message: 'Unable to connect to the telephony service.' }, { status: 500 });
    }
  } catch (err) {
    console.error("[/api/message] Unhandled error:", err);
    return NextResponse.json({ status: "error", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
