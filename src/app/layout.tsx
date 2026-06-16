import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Farreras Sales",
  description: "Eina de gestió comercial i seguiment d'ofertes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body className="antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-60 min-h-screen bg-slate-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
