import type { ReactNode } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="noise">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
