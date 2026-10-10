import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  let siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl && host) {
    siteUrl = `${protocol}://${host}`;
  }
  if (!siteUrl) {
    siteUrl = 'http://localhost:3000';
  }

  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  // return the user to an error page with instructions
  // or back to sign in
  return NextResponse.redirect(`${siteUrl}/auth/sign-in?error=OAuthFailed`);
}
