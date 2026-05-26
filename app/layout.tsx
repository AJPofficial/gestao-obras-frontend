import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Define a cor da barra superior do telemóvel para o teu laranja
export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export const metadata: Metadata = {
  title: "Gestão Interna de Obras",
  description: "Plataforma de gestão interna.",
  manifest: "/manifest.json",
  icons: {
    icon: "/perfil.png",
    apple: "/perfil.png", // Força o iPhone a usar o teu logo
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={inter.className}>{children}</body>
    </html>
  );
}