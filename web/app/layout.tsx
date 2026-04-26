import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Shell } from "@/components/layout/Shell";
import { Toaster } from "@/components/ui/sonner";

// Inter loaded via next/font — inlined at build time, no runtime external request.
// CSS variable --font-sans is referenced by --font-family-sans in globals.css.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Golf League",
  description: "Golf league management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Toaster />
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
