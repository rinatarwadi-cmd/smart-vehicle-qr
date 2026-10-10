import { Suspense } from "react";
import { resolveToken } from "@/lib/vehicle/resolveToken";
import { ScannerClient } from "@/components/ScannerClient";
import { ScannerSkeleton } from "@/components/ScannerSkeleton";
import { ScannerEmptyState } from "@/components/ScannerEmptyState";

interface PageProps {
  params: Promise<{ token: string }>;
}

/**
 * /t/[token] — Public QR Scanner Action Page
 *
 * Architecture:
 *  1. Token is resolved SERVER-SIDE via resolveToken() using the Supabase
 *     admin client. Only display-safe fields are returned to the client.
 *  2. <ScannerClient> is a Client Component that receives the safe
 *     VehiclePublicData object — no PII, no phone number.
 *  3. <Suspense> with <ScannerSkeleton> ensures no blank-screen flash
 *     during streaming SSR.
 *  4. All error/edge cases render appropriate empty states.
 */
async function ScannerContent({ token }: { token: string }) {
  const result = await resolveToken(token);

  if (result.status !== "ok") {
    return <ScannerEmptyState type={result.status === "error" ? "error" : result.status} />;
  }

  return <ScannerClient vehicle={result.vehicle} />;
}

export default async function ScannerPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <Suspense fallback={<ScannerSkeleton />}>
      <ScannerContent token={token} />
    </Suspense>
  );
}
