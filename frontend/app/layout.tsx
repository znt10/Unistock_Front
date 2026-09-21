import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unistock",
  description: "Sistema de controle de estoque e pedidos Unistock",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    // O iOS ignora os icones do manifest e so olha para esta.
    apple: "/icones/apple-touch-icon.png",
  },
  // O Safari nao implementa o manifest inteiro: sem isto, "Adicionar a Tela
  // de Inicio" abre o site dentro do navegador, com barra de endereco.
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Unistock",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
