import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Vehicle — Connected Without Sharing Your Number",
  description:
    "Scan any Smart Vehicle QR tag to instantly contact the owner through a private, encrypted relay. No phone numbers shared.",
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-sv-base text-sv-text-primary font-grotesk">
        {children}
      </body>
    </html>
  );
}
