import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Velocity Rentals — Premium Vehicle Hire, South Africa",
    template: "%s — Velocity Rentals",
  },
  description:
    "South Africa's premium vehicle rental house. Supercars, luxury SUVs, bakkies and people movers across Cape Town, Johannesburg, Durban and beyond. Rates in ZAR.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-ZA" className={`${anton.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-carbon font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
