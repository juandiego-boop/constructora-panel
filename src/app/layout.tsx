import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Constructora — Panel de Gestión",
  description: "Sistema operativo interno para constructora",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="ml-60 flex-1 p-8 max-w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
