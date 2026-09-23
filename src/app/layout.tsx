import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Second Date — Make the most of what you've opened",
  description: "A little home for the second shelf-life clock. Keep track of what you've opened, see what to use next, and make the most of the good stuff.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Second Date — Make the most of what you've opened",
    description: "The date on the package is only half the story. A calmer way to track everything you open.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
