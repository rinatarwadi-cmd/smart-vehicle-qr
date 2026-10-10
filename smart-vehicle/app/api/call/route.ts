import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * POST /api/call
 *
 * Initiates a Twilio outbound call to the vehicle owner.
 * The call bridges an anonymous scanner to the owner via Twilio's
 * REST API — the owner's phone number is resolved SERVER-SIDE only
 * and is NEVER returned in any response to the client.
 *
 * Twilio API:   https://www.twilio.com/docs/voice/api/call-resource
 * Auth:         HTTP Basic Auth — Account SID as username, Auth Token as password
 * Body format:  application/x-www-form-urlencoded
 *
 * Request body:  { token: string }
 * Response (ok): { status: "connecting", sessionId: string }
 * Response (err):{ status: "error", code: string }
 *
 * Rate limit: 3 attempts per token per 10-minute window.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body as { token?: string };

    // ── 1. Validate input ──────────────────────────────────────────────
    if (!token || typeof token !== "string" || token.length < 4) {
      return NextResponse.json(
        { status: "error", code: "INVALID_TOKEN" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { status: "error", code: "MISSING_CONFIG", message: "Supabase configuration missing" },
        { status: 500 }
      );
    }

    // ── 2. Dev mock: no Supabase/Twilio config ─────────────────────────
    if (
      process.env.NODE_ENV === "development" &&
      (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.SUPABASE_SERVICE_ROLE_KEY)
    ) {
      return NextResponse.json({
        status: "connecting",
        sessionId: `dev-mock-session-${Date.now()}`,
      });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // ── 3. Resolve token → owner phone (SERVER-SIDE ONLY) ──────────────
    const { data: tokenRow, error: tokenError } = await supabaseAdmin
      .from("qr_tokens")
      .select(
        `
        is_active,
        expires_at,
        vehicles (
          phone
        )
      `
      )
      .eq("token", token)
      .single();

    if (tokenError || !tokenRow) {
      return NextResponse.json(
        { status: "error", code: "TOKEN_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!tokenRow.is_active) {
      return NextResponse.json(
        { status: "error", code: "TOKEN_INACTIVE" },
        { status: 403 }
      );
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json(
        { status: "error", code: "TOKEN_EXPIRED" },
        { status: 403 }
      );
    }

    // Extract phone — this value NEVER leaves the server
    const ownerPhone = (
      tokenRow.vehicles as unknown as { phone: string } | null
    )?.phone;

    if (!ownerPhone) {
      return NextResponse.json(
        { status: "error", code: "OWNER_UNREACHABLE" },
        { status: 503 }
      );
    }

    // ── 4. Rate limiting ───────────────────────────────────────────────
    const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("call_attempts")
      .select("id", { count: "exact", head: true })
      .eq("token", token)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { status: "error", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    // ── 5. Twilio API call (using native fetch) ─────────────────────────
    const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const authToken  = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    const fromNumber = (process.env.TWILIO_PHONE_NUMBER || '').trim();

    let callSid: string;
    try {
      const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const voiceUrl = (process.env.TWILIO_VOICE_URL || 'http://demo.twilio.com/docs/voice.xml').trim();

      console.log('Initiating call on Account:', accountSid, 'from:', fromNumber, 'to:', ownerPhone);
      
      const payload = new URLSearchParams();
      payload.append('To', ownerPhone);
      payload.append('From', fromNumber);
      payload.append('Url', voiceUrl);

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
        console.error('Twilio Call Failed:', response.status, data);
        return NextResponse.json({ status: 'error', code: 'BRIDGE_FAILED', message: data.message || 'Call failed', twilioError: data }, { status: 400 });
      }

      callSid = data.sid;
      console.log('--- TWILIO SUCCESS ---', callSid);
    } catch (err: any) {
      console.error('Twilio fetch failed:', err);
      return NextResponse.json(
        { 
          status: 'error', 
          code: 'NETWORK_ERROR', 
          message: 'Unable to connect to the telephony service.', 
        }, 
        { status: 500 }
      );
    }

    // ── 6. Log attempt for rate limiting ──────────────────────────────
    await supabaseAdmin.from("call_attempts").insert({
      token,
      session_id: callSid,
    });

    // ── 7. Return only sessionId — phone is NEVER returned ─────────────
    return NextResponse.json({ status: 'connecting', sessionId: callSid });
  } catch (err) {
    console.error("[/api/call] Unhandled error:", err);
    return NextResponse.json(
      { status: "error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
