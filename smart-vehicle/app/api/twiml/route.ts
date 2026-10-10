import { NextResponse } from "next/server";

/**
 * GET /api/twiml
 *
 * Returns TwiML instructions to Twilio when an outbound call connects.
 * Twilio fetches this URL server-to-server when the owner answers.
 *
 * The message is spoken to the vehicle owner to explain why they're
 * receiving the call and allow them to connect or dismiss.
 *
 * TwiML docs: https://www.twilio.com/docs/voice/twiml
 */
export async function GET() {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-IN">
    Hello! Someone near your vehicle has scanned your Smart Vehicle Q R tag
    and would like to reach you.
    This call is completely anonymous and your contact details have not been shared.
    Please press 1 to accept the connection, or hang up to decline.
  </Say>
  <Gather numDigits="1" action="/api/twiml/gather" method="POST" timeout="10">
    <Say voice="Polly.Joanna" language="en-IN">
      Press 1 to connect, or hang up to decline.
    </Say>
  </Gather>
  <Say voice="Polly.Joanna" language="en-IN">
    No response received. Goodbye.
  </Say>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

// Twilio may also POST to this URL
export async function POST() {
  return GET();
}
