import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Serif para acentos itálicos de la landing.
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pulso | Tu red de apoyo en dos toques",
  description:
    "Pulso conecta un botón de ayuda con tu red familiar y un chequeo diario de bienestar. Prototipo con piloto propuesto en CDMX.",
  applicationName: "Pulso",
  appleWebApp: { capable: true, title: "Pulso", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0d5c63",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
