import type { Metadata } from "next";
import { AppFrame } from "@/components/frame/AppFrame";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whitelabel Design",
  description: "iOS-style design workspace with canvas, inspector, scenarios, and tweaks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
