import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Vehicle Owner — Smart Vehicle",
  description:
    "Privately contact this vehicle's owner through Smart Vehicle's encrypted relay. No personal information shared.",
};

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
