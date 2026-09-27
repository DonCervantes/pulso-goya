import type { MetadataRoute } from "next";

// Manifest de PWA: permite "Agregar a la pantalla de inicio" en Android/Chrome,
// dejando el botón de ayuda a un toque desde el teléfono.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulso — Tu red de apoyo",
    short_name: "Pulso",
    description: "Pide ayuda con un toque y mantén a tu familia al tanto.",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    background_color: "#f7fafc",
    theme_color: "#0d5c63",
    lang: "es-MX",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
