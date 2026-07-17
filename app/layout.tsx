import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Data Pegawai",
  description: "Kepegawaian v2 - Next.js, Drizzle, Hono, Tailwind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="id"
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <body className="min-h-screen flex flex-col bg-muted/30">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
