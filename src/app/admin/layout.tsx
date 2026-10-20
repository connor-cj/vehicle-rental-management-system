import type { Metadata } from "next";
import type { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";

export const metadata: Metadata = {
  title: "Admin — Velocity Rentals",
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-carbon">
      <Sidebar />
      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
