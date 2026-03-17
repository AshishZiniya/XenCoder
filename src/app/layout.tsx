import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import "./ui-components.css";
import "./canvas-overrides.css";
import "./markdown-styles.css";
import "../components/MaterialIcon.css";
import { ThemeProvider } from "../components/ThemeProvider";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FindGarden - AI Note Taking",
  description: "Create, organize, and enhance your notes with AI assistance",
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
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
