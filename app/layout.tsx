import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masters Tracker",
  description: "Live Masters pool tracker"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
