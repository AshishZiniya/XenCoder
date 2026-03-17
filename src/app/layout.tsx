import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import "./ui-components.css";
import "./canvas-overrides.css";
import "./markdown-styles.css";
import "../components/MaterialIcon.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "XenCoder - Agentic Multi-Chat Canvas",
  description: "Next-generation collaborative canvas for multi-agent coding and intelligent workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${barlow.variable} antialiased`}
      >
        <Analytics/>
        <SpeedInsights/>
        <ThemeProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
