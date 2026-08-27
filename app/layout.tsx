import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge Runner | Code execution platform",
  description: "A production-minded sandbox for running code at scale."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
