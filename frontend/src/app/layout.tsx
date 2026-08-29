import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Khan Store Premium — Soatlar, Ko'zoynaklar va Kepkalar Do'koni",
  description:
    "Khan Store Premium — Samarqand (Atlas SM) va O'zbekistondagi original soatlar, ko'zoynaklar va kepkalar onlayn marketplace'i.",
  keywords: "Khan Store Premium, Soatlar, Ko'zoynaklar, Kepkalar, Watch Store Samarqand, Atlas SM, Sunglasses, Caps",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Khan Store Premium",
    description: "Original soatlar, ko'zoynaklar va kepkalar do'koni. Samarqand va O'zbekiston bo'ylab tezkor yetkazish.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-main text-text-main min-h-screen flex flex-col justify-between selection:bg-accent-main selection:text-accent-fg font-sans transition-colors">
        <Providers>
          <Navbar />
          <main className="flex-1 bg-bg-main">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
